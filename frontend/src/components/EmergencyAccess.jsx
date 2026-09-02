import React, { useState } from "react";
import { api } from "../services/api";

export default function EmergencyAccess({ user, wallet, emergencyTriggered }) {
  const [patientId, setPatientId] = useState(user?.patientId || "");
  const [reason, setReason] = useState(emergencyTriggered ? "SOS button activated by patient" : "");
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const contract = wallet?.contract;

  async function handleEmergencyAccess() {
    if (!patientId || !reason) {
      alert("Please fill patient ID and reason");
      return;
    }
    setLoading(true);
    try {
      if (contract && wallet?.account) {
        try {
          const tx = await contract.emergencyAccess(patientId, reason);
          await tx.wait();
        } catch (err) {
          console.warn("On-chain emergency access:", err.message);
        }
      }

      await api.triggerEmergency({ patientId, reason, location: "Emergency access screen" });
      const response = await api.getEmergencySummary(patientId);
      if (response.success) setSummary(response.summary);
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="dashboard emergency-dashboard">
      <div className="dashboard-header">
        <h2>🚨 Emergency Access</h2>
      </div>

      {emergencyTriggered && (
        <div className="emergency-alert-banner">
          Emergency alert has been triggered. Contacts and ambulance service have been notified.
        </div>
      )}

      <div className="emergency-form">
        <div className="form-group">
          <label>Patient ID</label>
          <input value={patientId} onChange={(e) => setPatientId(e.target.value)} placeholder="Patient ID" required />
        </div>
        <div className="form-group">
          <label>Emergency Reason</label>
          <textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g., Patient unconscious, cardiac arrest" rows="3" required />
        </div>
        <button onClick={handleEmergencyAccess} disabled={loading || !patientId || !reason} className="btn-emergency">
          {loading ? "Accessing..." : "🚨 Trigger Emergency Access"}
        </button>
      </div>

      {summary && (
        <div className="emergency-summary">
          <h3>Emergency Summary</h3>
          <div className="summary-content">
            <p><strong>Patient:</strong> {summary.patientId}</p>
            <p><strong>Status:</strong> {summary.quickSummary}</p>
            {summary.aiAssessment && (
              <div className="summary-data">
                <h4>AI Assessment</h4>
                <p>Prediction: <strong>{summary.aiAssessment.prediction}</strong></p>
                <p>Risk Level: {summary.aiAssessment.risk_level}</p>
              </div>
            )}
            {summary.emergencyContacts?.length > 0 && (
              <div className="summary-data">
                <h4>Notified Contacts</h4>
                {summary.emergencyContacts.map((c) => <p key={c.id}>{c.name}: {c.phone}</p>)}
              </div>
            )}
            {summary.decryptedSample && (
              <div className="summary-data">
                <h4>Latest Vitals</h4>
                <pre>{JSON.stringify(summary.decryptedSample, null, 2)}</pre>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
