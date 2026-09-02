import React, { useState, useEffect, useCallback } from "react";
import { api } from "../services/api";

export default function DoctorDashboard({ user, wallet }) {
  const [records, setRecords] = useState([]);
  const [patientId, setPatientId] = useState("");
  const [accessGranted, setAccessGranted] = useState(false);
  const [schedule, setSchedule] = useState(null);
  const contract = wallet?.contract;

  const loadSchedule = useCallback(async () => {
    if (!user?.doctorId) return;
    try {
      const res = await api.getDoctorSchedule(user.doctorId);
      setSchedule(res);
    } catch (err) {
      console.error(err);
    }
  }, [user?.doctorId]);

  useEffect(() => {
    if (user?.doctorId) loadSchedule();
  }, [user?.doctorId, loadSchedule]);

  async function loadRecords() {
    try {
      const res = await api.getAllRecords(patientId);
      setRecords(res.data || []);
    } catch (err) {
      console.error(err);
    }
  }

  async function checkAccess() {
    if (!contract || !patientId || !wallet?.account) return;
    try {
      const has = await contract.hasAccess(patientId, wallet.account);
      setAccessGranted(has);
      if (has) loadRecords();
    } catch (err) {
      console.error(err);
    }
  }

  async function manageSlots() {
    const date = prompt("Enter date (YYYY-MM-DD):", new Date().toISOString().split("T")[0]);
    if (!date) return;
    const times = prompt("Enter times comma-separated:", "09:00,10:00,14:00,15:00");
    if (!times) return;
    try {
      await api.manageSlots({ doctorId: user.doctorId, date, times: times.split(",").map((t) => t.trim()) });
      alert("Slots added!");
      loadSchedule();
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <div className="dashboard doctor-dashboard">
      <div className="dashboard-header">
        <h2>Doctor Dashboard</h2>
        <button className="btn-primary" onClick={manageSlots}>Manage Time Slots</button>
      </div>

      {schedule && (
        <div className="record-form">
          <h3>Today's Schedule</h3>
          <p>Confirmed appointments: {schedule.appointments?.length || 0}</p>
          <p>Available slots: {schedule.slots?.filter((s) => s.available).length || 0}</p>
        </div>
      )}

      <div className="access-section">
        <div className="form-group">
          <label>Patient ID</label>
          <div className="input-group">
            <input value={patientId} onChange={(e) => setPatientId(e.target.value)} placeholder="Enter patient ID" />
            <button onClick={checkAccess} className="btn-secondary" disabled={!patientId}>Check Access</button>
          </div>
        </div>
        {patientId && (
          <div className={`access-status ${accessGranted ? "status-granted" : "status-denied"}`}>
            <span>{accessGranted ? "✓ Access Granted" : "✗ No Access — patient must grant via blockchain"}</span>
            {accessGranted && <button onClick={loadRecords} className="btn-primary">Refresh Records</button>}
          </div>
        )}
      </div>

      {accessGranted && records.length > 0 && (
        <div className="records-list">
          <h3>Patient Records</h3>
          <div className="records-grid">
            {records.map((r) => (
              <div key={r.id} className="record-card">
                <div className="record-header">
                  <span>{r.patientId}</span>
                  <span>{new Date(r.uploadedAt).toLocaleDateString()}</span>
                </div>
                <div className="record-hash">IPFS: {r.ipfsHash?.slice(0, 24)}...</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
