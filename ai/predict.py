import pickle
import numpy as np
import os

# -------------------------
# Load model + scaler once
# -------------------------
MODEL_PATH = os.path.join("models", "risk_model.pkl")
SCALER_PATH = os.path.join("models", "scaler.pkl")

if not os.path.exists(MODEL_PATH):
    raise FileNotFoundError("❌ risk_model.pkl not found. Train your model first.")

if not os.path.exists(SCALER_PATH):
    raise FileNotFoundError("❌ scaler.pkl not found. Train your model first.")

with open(MODEL_PATH, "rb") as f:
    model = pickle.load(f)

with open(SCALER_PATH, "rb") as f:
    scaler = pickle.load(f)

print("Model & scaler loaded successfully!")


# ------------------------------------
# Function: Predict risk for 1 patient
# ------------------------------------
def predict_risk(age, heart_rate, systolic_bp, diastolic_bp, blood_sugar):
    """Takes raw patient vitals and returns predicted risk (low/medium/high)."""

    # Input as numpy array
    features = np.array([[age, heart_rate, systolic_bp, diastolic_bp, blood_sugar]])

    # Scale using saved scaler
    features_scaled = scaler.transform(features)

    # Predict using saved model
    numeric_prediction = model.predict(features_scaled)[0]

    # Convert numeric → readable text
    reverse_map = {0: "low", 1: "medium", 2: "high"}
    readable_prediction = reverse_map[numeric_prediction]

    return readable_prediction


# -------------------------
# Quick local test
# -------------------------
if __name__ == "__main__":
    result = predict_risk(
        age=55,
        heart_rate=90,
        systolic_bp=140,
        diastolic_bp=85,
        blood_sugar=180
    )
    print("Predicted Risk:", result)
