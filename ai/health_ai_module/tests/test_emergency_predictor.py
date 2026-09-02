"""Unit tests for emergency predictor and fallback rule-based predictions."""

import pytest
import numpy as np
from health_ai_module.predictive_analytics.emergency_predictor import EmergencyPredictor
from health_ai_module.utils.data_preprocessor import DataPreprocessor


def test_emergency_predictor_initialization():
    predictor = EmergencyPredictor(model_path=None)
    assert not predictor.is_trained
    assert predictor.models == {}


def test_feature_extraction():
    predictor = EmergencyPredictor(model_path=None)
    health_data = {
        "age": 45,
        "weight_kg": 75,
        "heart_rate": 85,
        "blood_pressure": "130/85",
        "oxygen_saturation": 97,
        "temperature": 37.2,
        "respiration_rate": 18,
        "pain_level": 2,
        "consciousness_score": 10,
        "num_conditions": 1,
    }
    features = predictor._extract_features(health_data)
    assert len(features) == 11
    assert features[0] == 45
    assert features[3] == 130
    assert features[4] == 85
