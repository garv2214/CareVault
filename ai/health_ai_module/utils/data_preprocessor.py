"""
Data Preprocessor - Normalize and prepare health data for ML models
"""

from typing import Dict, List, Optional


class DataPreprocessor:
    """Preprocesses raw health data into model-ready format."""

    VITAL_RANGES = {
        "heart_rate": (40, 220),
        "blood_pressure_systolic": (80, 250),
        "blood_pressure_diastolic": (50, 170),
        "oxygen_saturation": (75, 100),
        "temperature": (35, 42),
        "respiration_rate": (8, 40),
        "pain_level": (0, 10),
        "consciousness_score": (0, 10),
        "age": (0, 120),
        "weight_kg": (20, 200),
    }

    def normalize_vitals(self, data: Dict) -> Dict:
        """Normalize vital signs from various input formats."""
        result = dict(data)

        # Handle blood pressure string format
        if "blood_pressure" in data and isinstance(data["blood_pressure"], str) and "/" in data["blood_pressure"]:
            parts = data["blood_pressure"].split("/")
            result["blood_pressure_systolic"] = float(parts[0])
            result["blood_pressure_diastolic"] = float(parts[1])

        # Map alternate field names
        aliases = {
            "systolic_bp": "blood_pressure_systolic",
            "diastolic_bp": "blood_pressure_diastolic",
            "heartRate": "heart_rate",
            "oxygenSaturation": "oxygen_saturation",
        }
        for alt, canonical in aliases.items():
            if alt in data and canonical not in result:
                result[canonical] = data[alt]

        # Clamp values to valid ranges
        for field, (lo, hi) in self.VITAL_RANGES.items():
            if field in result and result[field] is not None:
                result[field] = max(lo, min(hi, float(result[field])))

        return result

    def extract_feature_vector(self, data: Dict) -> List[float]:
        normalized = self.normalize_vitals(data)
        return [
            normalized.get("age", 40),
            normalized.get("weight_kg", 70),
            normalized.get("heart_rate", 80),
            normalized.get("blood_pressure_systolic", 120),
            normalized.get("blood_pressure_diastolic", 80),
            normalized.get("oxygen_saturation", 98),
            normalized.get("temperature", 37.0),
            normalized.get("respiration_rate", 16),
            normalized.get("pain_level", 0),
            normalized.get("consciousness_score", 10),
            normalized.get("num_conditions", 0),
        ]

    def validate(self, data: Dict) -> tuple:
        errors = []
        if not data:
            errors.append("Empty data")
        hr = data.get("heart_rate")
        if hr is not None and (hr < 20 or hr > 300):
            errors.append(f"Invalid heart_rate: {hr}")
        return len(errors) == 0, errors
