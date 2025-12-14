// frontend/src/components/PatientDashboard.jsx
import React, { useState, useEffect } from "react";
import { api } from "../services/api";

export default function PatientDashboard({ wallet }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    patientId: "",
    age: "",
    systolic_bp: "",
    diastolic_bp: "",
    heart_rate: "",
    temperature: "",
    blood_sugar: "",
    symptoms: "",
    diagnosis: "",
    notes: "",
  });
  const [riskPrediction, setRiskPrediction] = useState(null);

  useEffect(() => {
    if (wallet?.account) {
      loadRecords();
    }
  }, [wallet]);

  async function loadRecords() {
    try {
      const response = await api.getAllRecords();
      if (response.success) {
        setRecords(response.data || []);
      }
    } catch (err) {
      console.error("Load records error:", err);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    try {
      const recordData = {
        age: parseInt(formData.age),
        systolic_bp: parseInt(formData.systolic_bp),
        diastolic_bp: parseInt(formData.diastolic_bp),
        heart_rate: parseInt(formData.heart_rate),
        temperature: parseFloat(formData.temperature),
        blood_sugar: parseInt(formData.blood_sugar),
        symptoms: formData.symptoms,
        diagnosis: formData.diagnosis,
        notes: formData.notes,
        timestamp: new Date().toISOString(),
      };

      // Get risk prediction
      try {
        const prediction = await api.getRiskPrediction(recordData);
        if (prediction.success) {
          setRiskPrediction(prediction.prediction);
        }
      } catch (err) {
        console.error("Prediction error:", err);
      }

      // Add record
      const response = await api.addRecord(formData.patientId, recordData);
      if (response.success) {
        alert("Record added successfully!");
        setShowForm(false);
        setFormData({
          patientId: "",
          age: "",
          systolic_bp: "",
          diastolic_bp: "",
          heart_rate: "",
          temperature: "",
          blood_sugar: "",
          symptoms: "",
          diagnosis: "",
          notes: "",
        });
        loadRecords();
      } else {
        alert("Error: " + response.message);
      }
    } catch (err) {
      console.error("Submit error:", err);
      alert("Failed to add record: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  async function generateTestRecords(count = 50) {
    if (!window.confirm(`Generate ${count} test records automatically? This may take a minute.`)) {
      return;
    }

    setLoading(true);
    let success = 0;
    let failed = 0;

    for (let i = 0; i < count; i++) {
      const patientId = `patient-${String(i + 1).padStart(3, '0')}`;
      
      const recordData = {
        age: Math.floor(Math.random() * 60) + 20,
        systolic_bp: Math.floor(Math.random() * 60) + 100,
        diastolic_bp: Math.floor(Math.random() * 30) + 60,
        heart_rate: Math.floor(Math.random() * 50) + 60,
        temperature: parseFloat((Math.random() * 3 + 97).toFixed(1)),
        blood_sugar: Math.floor(Math.random() * 100) + 80,
        symptoms: ["fever, cough", "fatigue", "headache", "nausea", "chest pain"][Math.floor(Math.random() * 5)],
        diagnosis: ["Common cold", "Flu", "Hypertension", "Diabetes", "Arthritis"][Math.floor(Math.random() * 5)],
        notes: `Auto-generated test record #${i + 1}`,
        timestamp: new Date().toISOString(),
      };

      try {
        const response = await api.addRecord(patientId, recordData);
        if (response.success) {
          success++;
        } else {
          failed++;
        }
      } catch (err) {
        failed++;
        console.error(`Failed to add record ${i + 1}:`, err);
      }

      // Small delay to avoid overwhelming
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    setLoading(false);
    alert(`✅ Generated ${success} records successfully!\n${failed > 0 ? `⚠️ ${failed} failed.` : ''}\n\nRefresh to see them!`);
    loadRecords();
  }

  return (
    <div className="dashboard patient-dashboard">
      <div className="dashboard-header">
        <h2>Patient Dashboard</h2>
        <div style={{ display: "flex", gap: "1rem" }}>
          <button 
            onClick={() => generateTestRecords(50)} 
            className="btn-primary"
            disabled={loading}
            style={{ background: "#28a745" }}
          >
            {loading ? "Generating..." : "Generate 50 Records"}
          </button>
          <button onClick={() => setShowForm(!showForm)} className="btn-primary">
            {showForm ? "Cancel" : "Add New Record"}
          </button>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="record-form">
          <h3>Add Health Record</h3>
          
          <div className="form-group">
            <label>Patient ID</label>
            <input
              type="text"
              value={formData.patientId}
              onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Age</label>
              <input
                type="number"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Systolic BP</label>
              <input
                type="number"
                value={formData.systolic_bp}
                onChange={(e) => setFormData({ ...formData, systolic_bp: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Diastolic BP</label>
              <input
                type="number"
                value={formData.diastolic_bp}
                onChange={(e) => setFormData({ ...formData, diastolic_bp: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Heart Rate (bpm)</label>
              <input
                type="number"
                value={formData.heart_rate}
                onChange={(e) => setFormData({ ...formData, heart_rate: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Temperature (°F)</label>
              <input
                type="number"
                step="0.1"
                value={formData.temperature}
                onChange={(e) => setFormData({ ...formData, temperature: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Blood Sugar (mg/dL)</label>
              <input
                type="number"
                value={formData.blood_sugar}
                onChange={(e) => setFormData({ ...formData, blood_sugar: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Symptoms (comma-separated)</label>
            <input
              type="text"
              value={formData.symptoms}
              onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
              placeholder="e.g., fever, cough, headache"
            />
          </div>

          <div className="form-group">
            <label>Diagnosis</label>
            <input
              type="text"
              value={formData.diagnosis}
              onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows="4"
            />
          </div>

          {riskPrediction && (
            <div className="risk-prediction">
              <h4>AI Risk Assessment</h4>
              <p>
                Risk Level: <strong>{riskPrediction.risk_label}</strong>
              </p>
              <p>
                Probability: {(riskPrediction.risk_probability * 100).toFixed(1)}%
              </p>
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? "Submitting..." : "Submit Record"}
          </button>
        </form>
      )}

      <div className="records-list">
        <h3>Your Records</h3>
        {records.length === 0 ? (
          <p className="empty-state">No records found. Add your first record above.</p>
        ) : (
          <div className="records-grid">
            {records.map((record, idx) => (
              <div key={idx} className="record-card">
                <div className="record-header">
                  <span className="record-id">Patient: {record.patientId}</span>
                  <span className="record-date">
                    {new Date(record.uploadedAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="record-hash">
                  IPFS: {record.ipfsHash?.slice(0, 20)}...
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

