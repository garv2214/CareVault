import React, { useState, useEffect } from "react";
import { api } from "../services/api";

export default function MedicationReminders({ user }) {
  const [medications, setMedications] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", dosage: "", frequency: "daily", times: "08:00", notes: "" });

  useEffect(() => {
    async function fetchMeds() {
      try {
        const res = await api.getMedications(user.patientId);
        setMedications(res.data || []);
      } catch (err) {
        console.error(err);
      }
    }
    if (user?.patientId) fetchMeds();
  }, [user]);

  async function loadMeds() {
    try {
      const res = await api.getMedications(user.patientId);
      setMedications(res.data || []);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleAdd(e) {
    e.preventDefault();
    try {
      await api.addMedication({
        patientId: user.patientId,
        name: form.name,
        dosage: form.dosage,
        frequency: form.frequency,
        times: form.times.split(",").map((t) => t.trim()),
        notes: form.notes,
      });
      setShowForm(false);
      setForm({ name: "", dosage: "", frequency: "daily", times: "08:00", notes: "" });
      loadMeds();
    } catch (err) {
      alert(err.message);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Remove this medication?")) return;
    await api.deleteMedication(id);
    loadMeds();
  }

  async function toggleActive(med) {
    await api.updateMedication(med.id, { active: !med.active });
    loadMeds();
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Medication Reminders</h2>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "Add Medication"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="record-form">
          <div className="form-row">
            <div className="form-group">
              <label>Medication Name</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Dosage</label>
              <input value={form.dosage} onChange={(e) => setForm({ ...form, dosage: e.target.value })} placeholder="e.g., 500mg" required />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Frequency</label>
              <select value={form.frequency} onChange={(e) => setForm({ ...form, frequency: e.target.value })}>
                <option value="daily">Daily</option>
                <option value="twice_daily">Twice Daily</option>
                <option value="weekly">Weekly</option>
              </select>
            </div>
            <div className="form-group">
              <label>Reminder Times (comma-separated)</label>
              <input value={form.times} onChange={(e) => setForm({ ...form, times: e.target.value })} placeholder="08:00, 20:00" />
            </div>
          </div>
          <div className="form-group">
            <label>Notes</label>
            <input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>
          <button type="submit" className="btn-primary">Save Reminder</button>
        </form>
      )}

      <div className="records-grid">
        {medications.length === 0 ? (
          <p className="empty-state">No medications added yet.</p>
        ) : (
          medications.map((m) => (
            <div key={m.id} className={`record-card med-card ${!m.active ? "inactive" : ""}`}>
              <h4>{m.name}</h4>
              <p>{m.dosage} · {m.frequency}</p>
              <p>⏰ {Array.isArray(m.times) ? m.times.join(", ") : m.times}</p>
              {m.notes && <p className="text-muted">{m.notes}</p>}
              <div className="card-actions">
                <button className="btn-secondary btn-sm" onClick={() => toggleActive(m)}>
                  {m.active ? "Pause" : "Resume"}
                </button>
                <button className="btn-secondary btn-sm" onClick={() => handleDelete(m.id)}>Delete</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
