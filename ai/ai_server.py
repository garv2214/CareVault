# ai/ai_server.py
from flask import Flask, request, jsonify
import os
import joblib
import numpy as np
from utils.preprocessing import FEATURES
from utils.summarizer import simple_emergency_summary

MODEL_DIR = os.path.join(os.path.dirname(__file__), "model")
MODEL_PATH = os.path.join(MODEL_DIR, "risk_model.pkl")
SCALER_PATH = os.path.join(MODEL_DIR, "scaler.pkl")

app = Flask(__name__)

# lazy load model & scaler
model = None
scaler = None

def load_model():
    global model, scaler
    if model is None:
        model = joblib.load(MODEL_PATH)
    if scaler is None:
        scaler = joblib.load(SCALER_PATH)
    return model, scaler

@app.route("/")
def index():
    return "AI service running"

@app.route("/predict", methods=["POST"])
def predict():
    """
    Expects JSON body with numeric features or nested structure with vitals.
    Example:
    {
      "age": 45,
      "systolic_bp": 160,
      "diastolic_bp": 95,
      "heart_rate": 88,
      "blood_sugar": 190
    }
    """
    data = request.get_json() or {}
    # collect features with fallback defaults
    x = []
    for f in FEATURES:
        x.append(float(data.get(f, 0)))
    x_arr = np.array(x).reshape(1, -1)

    try:
        model, scaler = load_model()
    except Exception as e:
        return jsonify({"error": "Model not found. Please run train.py first.", "details": str(e)}), 500

    x_s = scaler.transform(x_arr)
    prob = model.predict_proba(x_s)[0][1]  # prob of class 1 (high risk)
    pred = int(prob >= 0.5)

    return jsonify({
        "risk_probability": float(prob),
        "risk_label": "High" if pred == 1 else "Low",
        "threshold": 0.5
    })

@app.route("/summarize", methods=["POST"])
def summarize():
    """
    Expects JSON:
    {
      "text": "full patient record notes or concatenated report"
    }
    """
    data = request.get_json() or {}
    text = data.get("text", "")
    if not text:
        return jsonify({"summary": "", "message": "No text provided"}), 400

    summary = simple_emergency_summary(text)
    return jsonify({"summary": summary})

@app.route("/train", methods=["POST"])
def train_endpoint():
    """
    Optional: retrain model on synthetic data. No body required.
    """
    try:
        from train import train_and_save
        train_and_save()
        return jsonify({"status": "trained"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    # load punkt if necessary
    import nltk
    try:
        nltk.data.find("tokenizers/punkt")
    except LookupError:
        nltk.download("punkt")
    app.run(port=8000, debug=True)
