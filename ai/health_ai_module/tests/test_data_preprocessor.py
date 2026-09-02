"""Unit tests for DataPreprocessor (normalization, aliasing, clamping)."""

import pytest
from health_ai_module.utils.data_preprocessor import DataPreprocessor


def test_normalize_vitals_blood_pressure_string():
    preprocessor = DataPreprocessor()
    data = {"blood_pressure": "140/90"}
    normalized = preprocessor.normalize_vitals(data)
    assert normalized["blood_pressure_systolic"] == 140.0
    assert normalized["blood_pressure_diastolic"] == 90.0


def test_normalize_vitals_aliases():
    preprocessor = DataPreprocessor()
    data = {
        "heartRate": 88,
        "oxygenSaturation": 96,
        "systolic_bp": 130,
        "diastolic_bp": 85,
    }
    normalized = preprocessor.normalize_vitals(data)
    assert normalized["heart_rate"] == 88
    assert normalized["oxygen_saturation"] == 96
    assert normalized["blood_pressure_systolic"] == 130
    assert normalized["blood_pressure_diastolic"] == 85


def test_normalize_vitals_clamping():
    preprocessor = DataPreprocessor()
    data = {
        "heart_rate": 500,  # exceeds max 220
        "oxygen_saturation": 50,  # below min 75
    }
    normalized = preprocessor.normalize_vitals(data)
    assert normalized["heart_rate"] == 220
    assert normalized["oxygen_saturation"] == 75


def test_extract_feature_vector():
    preprocessor = DataPreprocessor()
    data = {
        "age": 30,
        "heart_rate": 70,
        "blood_pressure_systolic": 115,
        "blood_pressure_diastolic": 75,
    }
    vector = preprocessor.extract_feature_vector(data)
    assert len(vector) == 11
    assert vector[0] == 30
    assert vector[2] == 70
