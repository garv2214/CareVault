import joblib
import numpy as np
from sklearn.preprocessing import StandardScaler

model = joblib.load("models/risk_model.pkl")
scaler = joblib.load("models/scaler.pkl")
mlb = joblib.load("models/symptom_encoder.pkl")
diagnosis_encoder = joblib.load("models/diagnosis_encoder.pkl")
risk_encoder = joblib.load("models/risk_encoder.pkl")

def predict_risk(data):
    # data = dict from backend

    symptoms_list = [s.strip() for s in data["symptoms"].split(",")]

    symptom_vector = mlb.transform([symptoms_list])[0]

    diagnosis_encoded = diagnosis_encoder.transform([data["diagnosis"]])[0]

    numeric = np.array([[
        data["age"],
        data["systolic_bp"],
        data["diastolic_bp"],
        data["heart_rate"],
        data["temperature"],
        data["blood_sugar"],
        diagnosis_encoded
    ]])

    numeric_scaled = scaler.transform(numeric)

    final_input = np.hstack([numeric_scaled, symptom_vector.reshape(1, -1)])

    pred = model.predict(final_input)[0]

    return risk_encoder.inverse_transform([pred])[0]
