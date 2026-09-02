"""Unit tests for HealthAIAgent device processing."""

import pytest
from health_ai_module.ai_agents.health_agent import HealthAIAgent


def test_process_normal_device_data():
    agent = HealthAIAgent()
    readings = {
        "heart_rate": 72,
        "oxygen_saturation": 98,
        "blood_pressure_systolic": 120,
    }
    result = agent.process_device_data("PAT-100", "smartwatch", readings)
    assert result["processed"] is True
    assert result["alert_triggered"] is False
    assert "normal" in result["recommendation"].lower()


def test_process_critical_device_data():
    agent = HealthAIAgent()
    critical_readings = {
        "heart_rate": 150,
        "oxygen_saturation": 88,
        "blood_pressure_systolic": 190,
    }
    result = agent.process_device_data("PAT-101", "smartwatch", critical_readings)
    assert result["processed"] is True
    assert result["alert_triggered"] is True
    assert "immediate" in result["recommendation"].lower()
