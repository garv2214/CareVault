"""
CareVault AI Server - FastAPI service for predictive analytics, classification, and federated learning
"""

import os
import sys
import logging
from typing import Dict, Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn

# Add parent to path for imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from health_ai_module.predictive_analytics.emergency_predictor import EmergencyPredictor
from health_ai_module.data_classifications.tabular_classifier import HealthDataClassifier
from health_ai_module.federated_learning.federated_learning import FederatedTrainer
from health_ai_module.federated_learning.node_manager import NodeManager
from health_ai_module.ai_agents.health_agent import HealthAIAgent
from health_ai_module.utils.data_preprocessor import DataPreprocessor

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="CareVault AI Service", version="2.0.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

predictor: Optional[EmergencyPredictor] = None
classifier: Optional[HealthDataClassifier] = None
federated_trainer: Optional[FederatedTrainer] = None
node_manager: Optional[NodeManager] = None
health_agent: Optional[HealthAIAgent] = None
preprocessor = DataPreprocessor()


class VitalsInput(BaseModel):
    age: Optional[float] = 40
    weight_kg: Optional[float] = 70
    heart_rate: Optional[float] = 80
    systolic_bp: Optional[float] = None
    diastolic_bp: Optional[float] = None
    blood_pressure_systolic: Optional[float] = 120
    blood_pressure_diastolic: Optional[float] = 80
    blood_pressure: Optional[str] = "120/80"
    oxygen_saturation: Optional[float] = 98
    temperature: Optional[float] = 37.0
    respiration_rate: Optional[float] = 16
    pain_level: Optional[float] = 0
    consciousness_score: Optional[float] = 10
    num_conditions: Optional[int] = 0
    symptoms: Optional[str] = ""
    diagnosis: Optional[str] = ""


class ClassifyInput(BaseModel):
    features: Dict


@app.on_event("startup")
async def startup():
    global predictor, classifier, federated_trainer, node_manager, health_agent
    logger.info("🏥 Starting CareVault AI Service...")

    model_path = os.path.join(os.path.dirname(__file__), "models", "emergency_model.pkl")
    predictor = EmergencyPredictor(model_path if os.path.exists(model_path) else None)

    if not getattr(predictor, 'is_trained', False):
        logger.info("Using rule-based fallback predictor (train with train_model.py for ML model)")

    classifier = HealthDataClassifier(use_tabpfn=True)
    federated_trainer = FederatedTrainer()
    node_manager = NodeManager()
    health_agent = HealthAIAgent(ai_service_url="http://localhost:8000")
    logger.info("✅ AI modules initialized")


@app.get("/")
async def root():
    return {"service": "CareVault AI", "status": "running", "version": "2.0.0"}


@app.get("/health")
async def health():
    return {"status": "healthy", "model_trained": getattr(predictor, 'is_trained', False)}


@app.post("/predict")
async def predict(vitals: VitalsInput):
    data = vitals.model_dump()
    normalized = preprocessor.normalize_vitals(data)

    if predictor and getattr(predictor, 'is_trained', False):
        try:
            risk_score, prediction, explanation = predictor.predict_emergency(normalized)
            return {
                "risk_score": explanation["risk_score"],
                "risk_level": explanation["risk_level"],
                "prediction": explanation["prediction"],
                "risk_label": explanation["prediction"],
                "risk_probability": explanation["risk_score"],
                "confidence": explanation["confidence"],
                "source": "ml-model",
            }
        except Exception as e:
            logger.warning(f"ML prediction failed, using fallback: {e}")

    return _rule_based_predict(normalized)


@app.post("/classify")
async def classify(input_data: ClassifyInput):
    if not classifier or not classifier.is_trained:
        return {"prediction": 0, "confidence": 0.5, "note": "Classifier not trained — returning default"}
    try:
        return classifier.classify(input_data.features)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/federated/status")
async def federated_status():
    return {
        "round": federated_trainer.current_round if federated_trainer else 0,
        "nodes": len(node_manager.nodes) if node_manager else 0,
        "is_trained": federated_trainer.is_trained if federated_trainer else False,
        "clusters": node_manager.get_cluster_summary() if node_manager else {},
    }


@app.post("/federated/register-node")
async def register_node(node_id: str, cluster_id: str = "default"):
    node_manager.register_node(node_id, cluster_id)
    return {"success": True, "node_id": node_id, "cluster": cluster_id}


@app.post("/agent/device-data")
async def receive_device_data(patient_id: str, device_type: str, readings: Dict):
    result = health_agent.process_device_data(patient_id, device_type, readings)
    return result


def _rule_based_predict(data: Dict) -> Dict:
    risk = 0.0
    hr = data.get("heart_rate", 80)
    sys = data.get("blood_pressure_systolic", 120)
    o2 = data.get("oxygen_saturation", 98)
    temp = data.get("temperature", 37.0)
    pain = data.get("pain_level", 0)
    consciousness = data.get("consciousness_score", 10)

    if hr > 120 or hr < 50: risk += 0.2
    if sys > 180: risk += 0.25
    if o2 < 92: risk += 0.3
    if temp > 38.5 or temp < 36: risk += 0.15
    if pain >= 8: risk += 0.15
    if consciousness < 7: risk += 0.25

    risk = min(risk, 1.0)
    prediction = "EMERGENCY" if risk > 0.5 else "STABLE"
    level = "CRITICAL" if risk > 0.8 else "HIGH" if risk > 0.6 else "MODERATE" if risk > 0.4 else "LOW"

    return {
        "risk_score": risk,
        "risk_level": level,
        "prediction": prediction,
        "risk_label": prediction,
        "risk_probability": risk,
        "confidence": 0.75 + risk * 0.2,
        "source": "rule-based",
    }


if __name__ == "__main__":
    port = int(os.environ.get("AI_PORT", 8000))
    uvicorn.run("ai_server:app", host="0.0.0.0", port=port, reload=False)
