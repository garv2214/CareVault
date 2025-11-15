from fastapi import FastAPI
from pydantic import BaseModel
from ai.predict import predict_risk


app = FastAPI(
    title="Medical Risk Prediction API",
    description="Predicts patient medical risk using ML model",
    version="1.0.0"
)

# -----------------------------
# Request Body Schema
# -----------------------------
class PatientData(BaseModel):
    age: int
    heart_rate: int
    systolic_bp: int
    diastolic_bp: int
    blood_sugar: int


# -----------------------------
# API Endpoint: /predict
# -----------------------------
@app.post("/predict")
def predict_endpoint(data: PatientData):
    risk = predict_risk(
        age=data.age,
        heart_rate=data.heart_rate,
        systolic_bp=data.systolic_bp,
        diastolic_bp=data.diastolic_bp,
        blood_sugar=data.blood_sugar,
    )
    return {
        "risk_level": risk,
        "message": f"Predicted risk is {risk}"
    }


# -----------------------------
# Root Endpoint
# -----------------------------
@app.get("/")
def home():
    return {"status": "API is running!"}
