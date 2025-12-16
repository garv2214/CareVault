// frontend/src/services/api.js

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:7000/api";

async function handleResponse(response) {
  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
    try {
      const errorJson = JSON.parse(errorText);
      errorMessage = errorJson.message || errorMessage;
    } catch (e) {
      errorMessage = errorText || errorMessage;
    }
    throw new Error(errorMessage);
  }
  return response.json();
}

export const api = {
  // Health Records
  async getAllRecords() {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      return await handleResponse(response);
    } catch (error) {
      console.error("getAllRecords error:", error);

      throw new Error(`Failed to fetch records: ${error.message}. Make sure backend is running on port 7000.`);
    }
  },

  async addRecord(patientId, recordData) {
    try {
      const response = await fetch(`${API_BASE_URL}/health`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientId, recordData }),
      });
      return await handleResponse(response);
    } catch (error) {
      console.error("addRecord error:", error);
      if (error.message.includes("Failed to fetch") || error.message.includes("NetworkError")) {

        throw new Error("Cannot connect to backend. Please make sure the backend server is running on port 7000.");
      }
      throw error;
    }
  },

  async getEmergencySummary(patientId) {
    try {
      const response = await fetch(`${API_BASE_URL}/health/emergency/${patientId}`);
      return await handleResponse(response);
    } catch (error) {
      console.error("getEmergencySummary error:", error);
      throw new Error(`Failed to get emergency summary: ${error.message}`);
    }
  },

  // AI Predictions
  async getRiskPrediction(vitals) {
    try {
      const response = await fetch(`${API_BASE_URL}/ai/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(vitals),
      });
      return await handleResponse(response);
    } catch (error) {
      console.error("getRiskPrediction error:", error);
      // Don't throw - AI prediction is optional
      return { success: false, error: error.message };
    }
  },
};

