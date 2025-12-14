// frontend/src/components/EmergencyAccess.jsx
import React, { useState } from "react";
import { api } from "../services/api";

export default function EmergencyAccess({ wallet, contract }) {
  const [patientId, setPatientId] = useState("");
  const [reason, setReason] = useState("");
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleEmergencyAccess() {
    if (!contract || !patientId || !reason || !wallet?.account) {
      alert("Please fill all fields and connect wallet");
      return;
    }

    setLoading(true);
    try {
      // Call emergency access on blockchain
      const tx = await contract.emergencyAccess(patientId, reason);
      await tx.wait();

      // Fetch emergency summary from backend
      const response = await api.getEmergencySummary(patientId);
      if (response.success) {
        setSummary(response.summary);
      } else {
        alert("Error fetching summary: " + response.message);
      }
    } catch (err) {
      console.error("Emergency access error:", err);
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

      <div className="emergency-form">
        <div className="form-group">
          <label>Patient ID</label>
          <input
            type="text"
            value={patientId}
            onChange={(e) => setPatientId(e.target.value)}
            placeholder="Enter patient ID"
            required
          />
        </div>

        <div className="form-group">
          <label>Emergency Reason</label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g., Patient unconscious, trauma, cardiac arrest"
            rows="3"
            required
          />
        </div>

        <button
          onClick={handleEmergencyAccess}
          disabled={loading || !patientId || !reason}
          className="btn-emergency"
        >
          {loading ? "Accessing..." : "Access Emergency Summary"}
        </button>
      </div>

      {summary && (
        <div className="emergency-summary">
          <h3>Emergency Summary</h3>
          <div className="summary-content">
            <p><strong>Patient ID:</strong> {summary.patientId}</p>
            <p><strong>IPFS CID:</strong> {summary.ipfsCid}</p>
            <div className="summary-data">
              <h4>Quick Summary:</h4>
              <p>{summary.quickSummary || "No summary available"}</p>
            </div>
            {summary.decryptedSample && (
              <div className="summary-data">
                <h4>Record Data:</h4>
                <pre>{JSON.stringify(summary.decryptedSample, null, 2)}</pre>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

