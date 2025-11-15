# ai/train.py
"""
Train a simple risk-prediction model on synthetic data.
Generates ai/data/synthetic_records.csv and saves model + scaler to ai/model/risk_model.pkl and scaler.pkl
"""

import os
import numpy as np
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report, accuracy_score
import joblib
from utils.preprocessing import FEATURES, load_synthetic, prepare_X_y, split_and_scale

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
MODEL_DIR = os.path.join(os.path.dirname(__file__), "model")
os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs(MODEL_DIR, exist_ok=True)

SYNTHETIC_CSV = os.path.join(DATA_DIR, "synthetic_records.csv")
MODEL_FILE = os.path.join(MODEL_DIR, "risk_model.pkl")
SCALER_FILE = os.path.join(MODEL_DIR, "scaler.pkl")

def generate_synthetic_data(n=2000, out_path=SYNTHETIC_CSV, random_state=42):
    np.random.seed(random_state)
    ages = np.random.randint(18, 90, size=n)
    systolic = np.random.normal(120, 20, size=n).astype(int)
    diastolic = np.random.normal(75, 10, size=n).astype(int)
    heart_rate = np.random.normal(75, 12, size=n).astype(int)
    blood_sugar = np.random.normal(110, 40, size=n).astype(int)

    # Simple rule to create a risk label (synthetic)
    risk = (
        (systolic > 140).astype(int) +
        (diastolic > 90).astype(int) +
        (blood_sugar > 180).astype(int) +
        (ages > 65).astype(int)
    )
    # binarize: if count >=1 -> high risk (1)
    risk = (risk >= 1).astype(int)

    df = pd.DataFrame({
        "age": ages,
        "systolic_bp": systolic,
        "diastolic_bp": diastolic,
        "heart_rate": heart_rate,
        "blood_sugar": blood_sugar,
        "risk": risk
    })
    df.to_csv(out_path, index=False)
    print(f"Generated synthetic data at {out_path} (n={n})")
    return df

def train_and_save():
    # generate if not exist
    if not os.path.exists(SYNTHETIC_CSV):
        generate_synthetic_data()

    df = load_synthetic(SYNTHETIC_CSV)
    X, y = prepare_X_y(df)
    X_train, X_test, y_train, y_test, scaler = split_and_scale(X, y)

    model = LogisticRegression(max_iter=1000)
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    print("Accuracy:", accuracy_score(y_test, y_pred))
    print(classification_report(y_test, y_pred))

    joblib.dump(model, MODEL_FILE)
    joblib.dump(scaler, SCALER_FILE)
    print(f"Saved model to {MODEL_FILE} and scaler to {SCALER_FILE}")

if __name__ == "__main__":
    # download punkt if necessary
    import nltk
    try:
        nltk.data.find("tokenizers/punkt")
    except LookupError:
        nltk.download("punkt")
    train_and_save()
