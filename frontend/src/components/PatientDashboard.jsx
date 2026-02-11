// frontend/src/components/PatientDashboard.jsx
import React, { useState, useEffect } from "react";
import { api } from "../services/api";

export default function PatientDashboard({ wallet }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [txStatus, setTxStatus] = useState(null);
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
    setLoading(true);
    try {
      const response = await api.getAllRecords();
      if (response.success) {
        setRecords(response.data || []);
      }
    } catch (err) {
      console.error("Load records error:", err);
    } finally {
      setLoading(false);
    }
  }

  function validateForm() {
    const errors = {};
    
    if (!formData.patientId.trim()) {
      errors.patientId = "Patient ID is required";
    }
    
    if (!formData.age || formData.age < 1 || formData.age > 120) {
      errors.age = "Valid age (1-120) is required";
    }
    
    if (!formData.systolic_bp || formData.systolic_bp < 70 || formData.systolic_bp > 250) {
      errors.systolic_bp = "Valid systolic BP (70-250) is required";
    }
    
    if (!formData.diastolic_bp || formData.diastolic_bp < 40 || formData.diastolic_bp > 150) {
      errors.diastolic_bp = "Valid diastolic BP (40-150) is required";
    }
    
    if (!formData.heart_rate || formData.heart_rate < 30 || formData.heart_rate > 200) {
      errors.heart_rate = "Valid heart rate (30-200) is required";
    }
    
    if (!formData.temperature || formData.temperature < 90 || formData.temperature > 110) {
      errors.temperature = "Valid temperature (90-110°F) is required";
    }
    
    if (!formData.blood_sugar || formData.blood_sugar < 50 || formData.blood_sugar > 500) {
      errors.blood_sugar = "Valid blood sugar (50-500 mg/dL) is required";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    setTxStatus({ status: 'validating', message: 'Validating form data...' });

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
      setTxStatus({ status: 'analyzing', message: 'Running AI risk assessment...' });
      try {
        const prediction = await api.getRiskPrediction(recordData);
        if (prediction.success) {
          setRiskPrediction(prediction.prediction);
        }
      } catch (err) {
        console.error("Prediction error:", err);
      }

      // Add record
      setTxStatus({ status: 'uploading', message: 'Uploading to IPFS...' });
      const response = await api.addRecord(formData.patientId, recordData);
      
      if (response.success) {
        setTxStatus({ status: 'success', message: 'Record added successfully!' });
        
        // Reset form
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
        
        setTimeout(() => {
          setShowForm(false);
          setTxStatus(null);
          loadRecords();
        }, 2000);
      } else {
        throw new Error(response.message);
      }
    } catch (err) {
      console.error("Submit error:", err);
      setTxStatus({ status: 'error', message: `Failed to add record: ${err.message}` });
    } finally {
      setSubmitting(false);
    }
  }

  async function generateTestRecords(count = 50) {
    if (!window.confirm(`Generate ${count} test records automatically? This may take a minute.`)) {
      return;
    }

    setLoading(true);
    setTxStatus({ status: 'generating', message: `Generating ${count} test records...` });
    
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

      // Update progress
      if (i % 10 === 0) {
        setTxStatus({ 
          status: 'generating', 
          message: `Generating records... ${i + 1}/${count} (${success} successful, ${failed} failed)` 
        });
      }

      // Small delay to avoid overwhelming
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    setLoading(false);
    setTxStatus(null);
    alert(`✅ Generated ${success} records successfully!\n${failed > 0 ? `⚠️ ${failed} failed.` : ''}\n\nRefresh to see them!`);
    loadRecords();
  }

  return (
    <div className="dashboard patient-dashboard">
      <div className="dashboard-header">
        <h2>🏥 Patient Dashboard</h2>
        <div className="header-actions">
          <button 
            onClick={() => generateTestRecords(50)} 
            className="btn-secondary"
            disabled={loading || submitting}
          >
            {loading ? "Generating..." : "Generate 50 Records"}
          </button>
          <button 
            onClick={() => setShowForm(!showForm)} 
            className="btn-primary"
            disabled={submitting}
          >
            {showForm ? "Cancel" : "Add New Record"}
          </button>
        </div>
      </div>

      {/* Transaction Status */}
      {txStatus && (
        <div className={`tx-status ${txStatus.status}`}>
          <div className="status-icon">
            {txStatus.status === 'validating' && <div className="spinner"></div>}
            {txStatus.status === 'analyzing' && <div className="pulse"></div>}
            {txStatus.status === 'uploading' && <div className="upload-icon">📤</div>}
            {txStatus.status === 'generating' && <div className="spinner"></div>}
            {txStatus.status === 'success' && <div className="success-icon">✅</div>}
            {txStatus.status === 'error' && <div className="error-icon">❌</div>}
          </div>
          <span className="status-message">{txStatus.message}</span>
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="record-form">
          <h3>📝 Add Health Record</h3>
          
          <div className="form-group">
            <label>Patient ID</label>
            <input
              type="text"
              value={formData.patientId}
              onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
              className={formErrors.patientId ? 'error' : ''}
              placeholder="e.g., patient-001"
            />
            {formErrors.patientId && <span className="error-text">{formErrors.patientId}</span>}
          </div>

          <div className="form-section">
            <h4>Vital Signs</h4>
            <div className="form-row">
              <div className="form-group">
                <label>Age</label>
                <input
                  type="number"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  className={formErrors.age ? 'error' : ''}
                  placeholder="years"
                />
                {formErrors.age && <span className="error-text">{formErrors.age}</span>}
              </div>

              <div className="form-group">
                <label>Systolic BP</label>
                <input
                  type="number"
                  value={formData.systolic_bp}
                  onChange={(e) => setFormData({ ...formData, systolic_bp: e.target.value })}
                  className={formErrors.systolic_bp ? 'error' : ''}
                  placeholder="mmHg"
                />
                {formErrors.systolic_bp && <span className="error-text">{formErrors.systolic_bp}</span>}
              </div>

              <div className="form-group">
                <label>Diastolic BP</label>
                <input
                  type="number"
                  value={formData.diastolic_bp}
                  onChange={(e) => setFormData({ ...formData, diastolic_bp: e.target.value })}
                  className={formErrors.diastolic_bp ? 'error' : ''}
                  placeholder="mmHg"
                />
                {formErrors.diastolic_bp && <span className="error-text">{formErrors.diastolic_bp}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Heart Rate</label>
                <input
                  type="number"
                  value={formData.heart_rate}
                  onChange={(e) => setFormData({ ...formData, heart_rate: e.target.value })}
                  className={formErrors.heart_rate ? 'error' : ''}
                  placeholder="bpm"
                />
                {formErrors.heart_rate && <span className="error-text">{formErrors.heart_rate}</span>}
              </div>

              <div className="form-group">
                <label>Temperature</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.temperature}
                  onChange={(e) => setFormData({ ...formData, temperature: e.target.value })}
                  className={formErrors.temperature ? 'error' : ''}
                  placeholder="°F"
                />
                {formErrors.temperature && <span className="error-text">{formErrors.temperature}</span>}
              </div>

              <div className="form-group">
                <label>Blood Sugar</label>
                <input
                  type="number"
                  value={formData.blood_sugar}
                  onChange={(e) => setFormData({ ...formData, blood_sugar: e.target.value })}
                  className={formErrors.blood_sugar ? 'error' : ''}
                  placeholder="mg/dL"
                />
                {formErrors.blood_sugar && <span className="error-text">{formErrors.blood_sugar}</span>}
              </div>
            </div>
          </div>

          <div className="form-section">
            <h4>Medical Information</h4>
            <div className="form-group">
              <label>Symptoms</label>
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
                placeholder="e.g., Common cold, Flu"
              />
            </div>

            <div className="form-group">
              <label>Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional notes or observations..."
                rows="4"
              />
            </div>
          </div>

          {riskPrediction && (
            <div className="risk-prediction">
              <h4>🤖 AI Risk Assessment</h4>
              <div className="risk-level">
                <span className={`risk-badge ${riskPrediction.risk_label.toLowerCase()}`}>
                  {riskPrediction.risk_label} Risk
                </span>
              </div>
              <div className="risk-probability">
                <div className="probability-bar">
                  <div 
                    className="probability-fill"
                    style={{ width: `${(riskPrediction.risk_probability * 100).toFixed(1)}%` }}
                  ></div>
                </div>
                <span className="probability-text">
                  {(riskPrediction.risk_probability * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          )}

          <button 
            type="submit" 
            disabled={submitting} 
            className="btn-primary btn-submit"
          >
            {submitting ? (
              <>
                <div className="btn-spinner"></div>
                Processing...
              </>
            ) : (
              "Submit Record"
            )}
          </button>
        </form>
      )}

      <div className="records-section">
        <div className="section-header">
          <h3>📊 Your Health Records</h3>
          <button onClick={loadRecords} className="btn-refresh" disabled={loading}>
            {loading ? "Refreshing..." : "🔄 Refresh"}
          </button>
        </div>
        
        {loading && (
          <div className="loading-state">
            <div className="skeleton-grid">
              {[1, 2, 3].map(i => (
                <div key={i} className="skeleton-card">
                  <div className="skeleton-line"></div>
                  <div className="skeleton-line short"></div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {!loading && records.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <p>No health records found.</p>
            <p>Add your first record using the form above.</p>
          </div>
        )}
        
        {!loading && records.length > 0 && (
          <div className="records-grid">
            {records.map((record, idx) => (
              <div key={idx} className="record-card">
                <div className="record-header">
                  <span className="record-id">👤 {record.patientId}</span>
                  <span className="record-date">
                    {new Date(record.uploadedAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="record-hash">
                  <span className="hash-label">IPFS:</span>
                  <span className="hash-value">{record.ipfsHash?.slice(0, 20)}...</span>
                </div>
                <div className="record-actions">
                  <button className="btn-view">View Details</button>
                  <button className="btn-share">Share</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
