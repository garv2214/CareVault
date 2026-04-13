// frontend/js/api.js - API wrapper for Care-Vault backend
const API_BASE = 'http://localhost:5000/api';

async function apiCall(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  };
  const resp = await fetch(url, config);
  if (!resp.ok) {
    throw new Error(`API error: ${resp.status}`);
  }
  return resp.json();
}

export const healthAPI = {
  getRecords: (patientId) => apiCall(`/health/records/${patientId}`),
  addRecord: (data) => apiCall('/health/', { method: 'POST', body: JSON.stringify(data) }),
  requestAccess: (data) => apiCall('/health/access/request', { method: 'POST', body: JSON.stringify(data) }),
  triggerEmergency: (data) => apiCall('/health/emergency', { method: 'POST', body: JSON.stringify(data) }),
  getEmergencySummary: (patientId) => apiCall(`/health/emergency/${patientId}`),
  getABI: () => apiCall('/abi')
};

export default apiCall;
