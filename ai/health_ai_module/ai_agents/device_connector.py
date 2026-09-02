"""
Device Connector - Interface for wearables and remote monitoring systems
"""

from typing import Dict, List, Callable, Optional
import logging
from datetime import datetime

logger = logging.getLogger(__name__)


class DeviceConnector:
    """Connects smart devices and wearables to the health AI pipeline."""

    SUPPORTED_DEVICES = ["fitbit", "apple_watch", "blood_pressure_monitor", "glucose_meter", "pulse_oximeter"]

    def __init__(self, on_data_received: Optional[Callable] = None):
        self.connected_devices: Dict[str, Dict] = {}
        self.on_data_received = on_data_received
        self.reading_history: List[Dict] = []

    def connect_device(self, patient_id: str, device_type: str, device_id: str) -> Dict:
        if device_type not in self.SUPPORTED_DEVICES:
            logger.warning(f"Unknown device type: {device_type}, registering anyway")
        key = f"{patient_id}:{device_id}"
        self.connected_devices[key] = {
            "patient_id": patient_id,
            "device_type": device_type,
            "device_id": device_id,
            "connected_at": datetime.now().isoformat(),
            "status": "connected",
        }
        logger.info(f"Device {device_id} ({device_type}) connected for patient {patient_id}")
        return self.connected_devices[key]

    def disconnect_device(self, patient_id: str, device_id: str) -> bool:
        key = f"{patient_id}:{device_id}"
        if key in self.connected_devices:
            del self.connected_devices[key]
            return True
        return False

    def receive_reading(self, patient_id: str, device_id: str, readings: Dict) -> Dict:
        entry = {
            "patient_id": patient_id,
            "device_id": device_id,
            "readings": readings,
            "timestamp": datetime.now().isoformat(),
        }
        self.reading_history.append(entry)
        if self.on_data_received:
            return self.on_data_received(patient_id, readings)
        return {"received": True, "timestamp": entry["timestamp"]}

    def get_connected_devices(self, patient_id: str) -> List[Dict]:
        return [d for k, d in self.connected_devices.items() if d["patient_id"] == patient_id]

    def get_recent_readings(self, patient_id: str, limit: int = 10) -> List[Dict]:
        patient_readings = [r for r in self.reading_history if r["patient_id"] == patient_id]
        return patient_readings[-limit:]
