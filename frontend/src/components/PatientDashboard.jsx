import React, { useState, useEffect } from "react";
import { api } from "../services/api";

export default function PatientDashboard({ user, wallet }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showGrant, setShowGrant] = useState(false);
  const [grantAddress, setGrantAddress] = useState("");
  const [contacts, setContacts] = useState([]);
  const [formData, setFormData] = useState({
    age: "", systolic_bp: "", diastolic_bp: "", heart_rate: "",
    temperature: "", blood_sugar: "", symptoms: "", diagnosis: "", notes: "",
  });
  const [riskPrediction, setRiskPrediction] = useState(null);
  const [contactForm, setContactForm] = useState({ name: "", phone: "", relationship: "" });

  const patientId = user?.patientId;

  useEffect(() => {
    async function fetchData() {
      try {
        const [recRes, contRes] = await Promise.all([
          api.getAllRecords(patientId),
          api.getEmergencyContacts(patientId),
        ]);
        setRecords(recRes.data || []);
        setContacts(contRes.data || []);
      } catch (err) {
        console.error(err);
      }
    }
    if (patientId) {
      fetchData();
    }
  }, [patientId]);

  async function loadRecords() {
    try {
      const res = await api.getAllRecords(patientId);
      setRecords(res.data || []);
    } catch (err) {
      console.error(err);
    }
  }

  async function loadContacts() {
    try {
      const res = await api.getEmergencyContacts(patientId);
      setContacts(res.data || []);
    } catch (err) {
      console.error(err);
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

      try {
        const pred = await api.getRiskPrediction(recordData);
        if (pred.success) setRiskPrediction(pred.prediction);
      } catch (err) {
        console.error("Prediction error:", err);
      }

      const res = await api.addRecord(patientId, recordData);
      if (res.success) {
        alert("Record added and stored on IPFS + blockchain!");
        setShowForm(false);
        setFormData({ age: "", systolic_bp: "", diastolic_bp: "", heart_rate: "", temperature: "", blood_sugar: "", symptoms: "", diagnosis: "", notes: "" });
        loadRecords();
      }
    } catch (err) {
      alert("Failed: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleGrantAccess() {
    if (!grantAddress) return alert("Enter doctor wallet address");
    try {
      const res = await api.grantAccess({ patientId, granteeAddress: grantAddress, expiresAt: 0 });
      alert("Access granted on-chain! Tx: " + (res.txHash || "pending"));
      setShowGrant(false);
    } catch (err) {
      alert(err.message);
    }
  }

  async function handleAddContact(e) {
    e.preventDefault();
    await api.addEmergencyContact({ patientId, ...contactForm });
    setContactForm({ name: "", phone: "", relationship: "" });
    loadContacts();
  }

  return (
    <div className="dashboard patient-dashboard">
      <div className="dashboard-header">
        <h2>My Health Records</h2>
        <div className="header-btns">
          <button onClick={() => setShowGrant(!showGrant)} className="btn-secondary">Grant Access</button>
          <button onClick={() => setShowForm(!showForm)} className="btn-primary">
            {showForm ? "Cancel" : "Add Record"}
          </button>
        </div>
      </div>

      <p className="patient-id">Patient ID: <strong>{patientId}</strong></p>

      {showGrant && (
        <div className="record-form">
          <h3>Grant Doctor Access (Blockchain)</h3>
          <div className="input-group">
            <input placeholder="Doctor wallet address (0x...)" value={grantAddress} onChange={(e) => setGrantAddress(e.target.value)} />
            <button className="btn-primary" onClick={handleGrantAccess}>Grant</button>
          </div>
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="record-form">
          <h3>Add Health Record</h3>
          <div className="form-row">
            <div className="form-group"><label>Age</label><input type="number" value={formData.age} onChange={(e) => setFormData({ ...formData, age: e.target.value })} required /></div>
            <div className="form-group"><label>Systolic BP</label><input type="number" value={formData.systolic_bp} onChange={(e) => setFormData({ ...formData, systolic_bp: e.target.value })} required /></div>
            <div className="form-group"><label>Diastolic BP</label><input type="number" value={formData.diastolic_bp} onChange={(e) => setFormData({ ...formData, diastolic_bp: e.target.value })} required /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label>Heart Rate</label><input type="number" value={formData.heart_rate} onChange={(e) => setFormData({ ...formData, heart_rate: e.target.value })} required /></div>
            <div className="form-group"><label>Temperature (°F)</label><input type="number" step="0.1" value={formData.temperature} onChange={(e) => setFormData({ ...formData, temperature: e.target.value })} required /></div>
            <div className="form-group"><label>Blood Sugar</label><input type="number" value={formData.blood_sugar} onChange={(e) => setFormData({ ...formData, blood_sugar: e.target.value })} /></div>
          </div>
          <div className="form-group"><label>Symptoms</label><input value={formData.symptoms} onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })} /></div>
          <div className="form-group"><label>Diagnosis</label><input value={formData.diagnosis} onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })} /></div>
          <div className="form-group"><label>Notes</label><textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} rows="3" /></div>
          {riskPrediction && (
            <div className={`risk-prediction ${riskPrediction.prediction === "EMERGENCY" ? "risk-high" : ""}`}>
              <h4>AI Risk Assessment</h4>
              <p>Risk: <strong>{riskPrediction.risk_label || riskPrediction.prediction}</strong> ({((riskPrediction.risk_probability || riskPrediction.risk_score || 0) * 100).toFixed(1)}%)</p>
            </div>
          )}
          <button type="submit" className="btn-primary" disabled={loading}>{loading ? "Saving..." : "Submit Record"}</button>
        </form>
      )}

      <div className="record-form">
        <h3>Emergency Contacts</h3>
        <form onSubmit={handleAddContact} className="form-row">
          <div className="form-group"><input placeholder="Name" value={contactForm.name} onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })} required /></div>
          <div className="form-group"><input placeholder="Phone" value={contactForm.phone} onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })} required /></div>
          <div className="form-group"><input placeholder="Relationship" value={contactForm.relationship} onChange={(e) => setContactForm({ ...contactForm, relationship: e.target.value })} /></div>
          <button type="submit" className="btn-primary">Add</button>
        </form>
        {contacts.map((c) => <p key={c.id}>{c.name} — {c.phone} ({c.relationship})</p>)}
      </div>

      <div className="records-list">
        <h3>Your Records ({records.length})</h3>
        {records.length === 0 ? (
          <p className="empty-state">No records yet. Add your first health record above.</p>
        ) : (
          <div className="records-grid">
            {records.map((r) => (
              <div key={r.id} className="record-card">
                <div className="record-header">
                  <span className="record-id">{r.patientId}</span>
                  <span className="record-date">{new Date(r.uploadedAt).toLocaleDateString()}</span>
                </div>
                <div className="record-hash">IPFS: {r.ipfsHash?.slice(0, 24)}...</div>
                {r.contentHash && <div className="record-hash">Hash: {r.contentHash?.slice(0, 24)}...</div>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
