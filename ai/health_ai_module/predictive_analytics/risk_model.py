"""
Risk Model - Composite risk scoring for health emergencies
"""

from typing import Dict, List, Tuple
import numpy as np


class RiskModel:
    """Multi-factor risk scoring model for health emergencies."""

    WEIGHTS = {
        "heart_rate": 0.15,
        "blood_pressure": 0.20,
        "oxygen_saturation": 0.25,
        "temperature": 0.10,
        "pain_level": 0.10,
        "consciousness": 0.15,
        "age_factor": 0.05,
    }

    def compute_vital_risk(self, vitals: Dict) -> Dict[str, float]:
        risks = {}
        hr = vitals.get("heart_rate", 80)
        risks["heart_rate"] = 1.0 if hr > 140 or hr < 45 else 0.5 if hr > 120 or hr < 50 else 0.0

        sys = vitals.get("blood_pressure_systolic", 120)
        dia = vitals.get("blood_pressure_diastolic", 80)
        risks["blood_pressure"] = 1.0 if sys > 200 or dia > 120 else 0.5 if sys > 160 else 0.0

        o2 = vitals.get("oxygen_saturation", 98)
        risks["oxygen_saturation"] = 1.0 if o2 < 88 else 0.5 if o2 < 92 else 0.0

        temp = vitals.get("temperature", 37.0)
        risks["temperature"] = 0.5 if temp > 39 or temp < 35.5 else 0.0

        pain = vitals.get("pain_level", 0)
        risks["pain_level"] = 1.0 if pain >= 9 else 0.5 if pain >= 7 else 0.0

        consciousness = vitals.get("consciousness_score", 10)
        risks["consciousness"] = 1.0 if consciousness < 5 else 0.5 if consciousness < 8 else 0.0

        age = vitals.get("age", 40)
        risks["age_factor"] = 0.5 if age > 75 else 0.2 if age > 65 else 0.0

        return risks

    def aggregate_risk(self, vitals: Dict) -> Tuple[float, str, List[str]]:
        vital_risks = self.compute_vital_risk(vitals)
        total = sum(vital_risks[k] * self.WEIGHTS[k] for k in self.WEIGHTS)
        total = min(total, 1.0)

        level = "CRITICAL" if total > 0.8 else "HIGH" if total > 0.6 else "MODERATE" if total > 0.4 else "LOW"
        factors = [k for k, v in vital_risks.items() if v > 0]

        return total, level, factors
