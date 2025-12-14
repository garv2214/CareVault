// frontend/src/components/DoctorDashboard.jsx
import React, { useState, useEffect } from "react";
import { api } from "../services/api";

export default function DoctorDashboard({ wallet, contract }) {
  const [records, setRecords] = useState([]);
  const [patientId, setPatientId] = useState("");
  const [accessGranted, setAccessGranted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (wallet?.account && patientId) {
      checkAccess();
    }
  }, [wallet, patientId]);

  async function checkAccess() {
    if (!contract || !patientId || !wallet?.account) return;

    try {
      const hasAccess = await contract.hasAccess(patientId, wallet.account);
      setAccessGranted(hasAccess);
      if (hasAccess) {
        loadRecords();
      }
    } catch (err) {
      console.error("Check access error:", err);
    }
  }

  async function requestAccess() {
    if (!contract || !patientId || !wallet?.account) {
      alert("Please connect wallet and enter patient ID");
      return;
    }

    setLoading(true);
    try {
      // In a real app, this would trigger a request that the patient approves
      // For now, we'll show a message
      alert(
        `Access request sent for patient ${patientId}. The patient needs to grant access via the smart contract.`
      );
    } catch (err) {
      console.error("Request access error:", err);
      alert("Error requesting access: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  async function loadRecords() {
    try {
      const response = await api.getAllRecords();
      if (response.success) {
        const patientRecords = (response.data || []).filter(
          (r) => r.patientId === patientId
        );
        setRecords(patientRecords);
      }
    } catch (err) {
      console.error("Load records error:", err);
    }
  }

  return (
    <div className="dashboard doctor-dashboard">
      <div className="dashboard-header">
        <h2>Doctor Dashboard</h2>
      </div>

      <div className="access-section">
        <div className="form-group">
          <label>Patient ID</label>
          <div className="input-group">
            <input
              type="text"
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              placeholder="Enter patient ID"
            />
            <button
              onClick={checkAccess}
              className="btn-secondary"
              disabled={!patientId}
            >
              Check Access
            </button>
          </div>
        </div>

        {patientId && (
          <div className="access-status">
            {accessGranted ? (
              <div className="status-granted">
                <span>✓ Access Granted</span>
                <button onClick={loadRecords} className="btn-primary">
                  Load Records
                </button>
              </div>
            ) : (
              <div className="status-denied">
                <span>✗ No Access</span>
                <button
                  onClick={requestAccess}
                  disabled={loading}
                  className="btn-primary"
                >
                  {loading ? "Requesting..." : "Request Access"}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {accessGranted && records.length > 0 && (
        <div className="records-list">
          <h3>Patient Records</h3>
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
        </div>
      )}
    </div>
  );
}

