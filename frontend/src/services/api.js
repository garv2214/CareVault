// frontend/src/services/api.js
const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

function getToken() {
  return localStorage.getItem("carevault_token");
}

function setToken(token) {
  if (token) localStorage.setItem("carevault_token", token);
  else localStorage.removeItem("carevault_token");
}

function getUser() {
  const u = localStorage.getItem("carevault_user");
  return u ? JSON.parse(u) : null;
}

function setUser(user) {
  if (user) localStorage.setItem("carevault_user", JSON.stringify(user));
  else localStorage.removeItem("carevault_user");
}

async function handleResponse(response) {
  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = `HTTP ${response.status}`;
    try {
      const errorJson = JSON.parse(errorText);
      errorMessage = errorJson.message || errorMessage;
    } catch {
      errorMessage = errorText || errorMessage;
    }
    throw new Error(errorMessage);
  }
  return response.json();
}

async function request(path, options = {}) {
  const headers = { "Content-Type": "application/json", ...options.headers };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  const response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
  return handleResponse(response);
}

export const api = {
  getToken, setToken, getUser, setUser,

  // Auth
  sendOtp: (phone) => request("/auth/send-otp", { method: "POST", body: JSON.stringify({ phone }) }),
  verifyOtp: (phone, otp) => request("/auth/verify-otp", { method: "POST", body: JSON.stringify({ phone, otp }) }),
  register: (data) => request("/auth/register", { method: "POST", body: JSON.stringify(data) }),
  getProfile: () => request("/auth/profile"),
  updateProfile: (data) => request("/auth/profile", { method: "PUT", body: JSON.stringify(data) }),

  // Health Records
  getAllRecords: (patientId) => request(`/health${patientId ? `?patientId=${patientId}` : ""}`),
  addRecord: (patientId, recordData) => request("/health", { method: "POST", body: JSON.stringify({ patientId, recordData }) }),
  getEmergencySummary: (patientId) => request(`/health/emergency/${patientId}`),
  triggerEmergency: (data) => request("/health/emergency/trigger", { method: "POST", body: JSON.stringify(data) }),
  addEmergencyContact: (data) => request("/health/emergency-contacts", { method: "POST", body: JSON.stringify(data) }),
  getEmergencyContacts: (patientId) => request(`/health/emergency-contacts/${patientId}`),
  grantAccess: (data) => request("/health/grant-access", { method: "POST", body: JSON.stringify(data) }),
  getAuditLog: (patientId) => request(`/health/audit/${patientId}`),

  // Providers
  getDoctors: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/providers/doctors${q ? `?${q}` : ""}`);
  },
  getDoctor: (id) => request(`/providers/doctors/${id}`),
  getHospitals: (city) => request(`/providers/hospitals${city ? `?city=${city}` : ""}`),
  getSpecialties: () => request("/providers/specialties"),
  getSlots: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/providers/slots${q ? `?${q}` : ""}`);
  },
  addDoctor: (data) => request("/providers/doctors", { method: "POST", body: JSON.stringify(data) }),
  addHospital: (data) => request("/providers/hospitals", { method: "POST", body: JSON.stringify(data) }),
  manageSlots: (data) => request("/providers/slots", { method: "POST", body: JSON.stringify(data) }),

  // Appointments
  bookAppointment: (data) => request("/appointments/book", { method: "POST", body: JSON.stringify(data) }),
  getAppointments: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/appointments${q ? `?${q}` : ""}`);
  },
  cancelAppointment: (id) => request(`/appointments/${id}`, { method: "DELETE" }),
  getDoctorSchedule: (doctorId) => request(`/appointments/schedule/${doctorId}`),

  // Content
  getMedications: (patientId) => request(`/content/medications${patientId ? `?patientId=${patientId}` : ""}`),
  addMedication: (data) => request("/content/medications", { method: "POST", body: JSON.stringify(data) }),
  updateMedication: (id, data) => request(`/content/medications/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteMedication: (id) => request(`/content/medications/${id}`, { method: "DELETE" }),
  getArticles: (category) => request(`/content/articles${category ? `?category=${category}` : ""}`),
  getArticle: (id) => request(`/content/articles/${id}`),
  getNotifications: () => request("/content/notifications"),

  // AI
  getRiskPrediction: (vitals) => request("/ai/predict", { method: "POST", body: JSON.stringify(vitals) }),
  getFederatedStatus: () => request("/ai/federated/status"),
};
