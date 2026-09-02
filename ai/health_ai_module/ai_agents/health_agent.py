"""
Health AI Agent - Bridge between AI analysis and decentralized health records
"""

from typing import Dict, Optional
import logging

logger = logging.getLogger(__name__)


class HealthAIAgent:
    """AI agent that processes health data and coordinates with devices."""

    def __init__(self, ai_service_url: str = "http://localhost:8000"):
        self.ai_service_url = ai_service_url
        self.active_sessions: Dict[str, Dict] = {}

    def process_device_data(self, patient_id: str, device_type: str, readings: Dict) -> Dict:
        """Process incoming data from wearables/smart devices."""
        session_key = f"{patient_id}:{device_type}"
        self.active_sessions[session_key] = {
            "patient_id": patient_id,
            "device_type": device_type,
            "last_readings": readings,
        }

        risk_indicators = self._analyze_readings(readings)
        alert = risk_indicators["risk_score"] > 0.6

        result = {
            "patient_id": patient_id,
            "device_type": device_type,
            "processed": True,
            "risk_indicators": risk_indicators,
            "alert_triggered": alert,
            "recommendation": "Seek immediate medical attention" if alert else "Vitals within normal range",
        }

        if alert:
            logger.warning(f"⚠️ Alert for {patient_id} from {device_type}: risk={risk_indicators['risk_score']:.2f}")

        return result

    def _analyze_readings(self, readings: Dict) -> Dict:
        risk = 0.0
        if readings.get("heart_rate", 80) > 120:
            risk += 0.3
        if readings.get("oxygen_saturation", 98) < 92:
            risk += 0.4
        if readings.get("blood_pressure_systolic", 120) > 180:
            risk += 0.3
        return {"risk_score": min(risk, 1.0), "factors_analyzed": list(readings.keys())}

    def get_patient_session(self, patient_id: str) -> Optional[Dict]:
        for key, session in self.active_sessions.items():
            if session["patient_id"] == patient_id:
                return session
        return None
