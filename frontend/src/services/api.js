// frontend/src/services/api.js
const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

export const api = {
  // Health Records
  async getAllRecords() {
    const response = await fetch(`${API_BASE_URL}/health`);
    return response.json();
  },

  async addRecord(patientId, recordData) {
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ patientId, recordData }),
    });
    return response.json();
  },

  async getEmergencySummary(patientId) {
    const response = await fetch(`${API_BASE_URL}/health/emergency/${patientId}`);
    return response.json();
  },

  // AI Predictions
  async getRiskPrediction(vitals) {
    const response = await fetch(`${API_BASE_URL}/ai/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(vitals),
    });
    return response.json();
  },
};

