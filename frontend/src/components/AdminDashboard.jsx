import React, { useState, useEffect } from "react";
import { api } from "../services/api";

export default function AdminDashboard() {
  const [doctors, setDoctors] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [form, setForm] = useState({ type: "doctor", name: "", specialty: "general", city: "", address: "", bio: "" });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const [d, h] = await Promise.all([api.getDoctors(), api.getHospitals()]);
    setDoctors(d.data || []);
    setHospitals(h.data || []);
  }

  async function handleAdd(e) {
    e.preventDefault();
    try {
      if (form.type === "doctor") {
        await api.addDoctor({ name: form.name, specialty: form.specialty, city: form.city, bio: form.bio });
      } else {
        await api.addHospital({ name: form.name, city: form.city, address: form.address });
      }
      alert("Added successfully!");
      setForm({ type: form.type, name: "", specialty: "general", city: "", address: "", bio: "" });
      loadData();
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Admin Dashboard</h2>
      </div>

      <form onSubmit={handleAdd} className="record-form">
        <h3>Add Directory Entry</h3>
        <div className="form-group">
          <label>Type</label>
          <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
            <option value="doctor">Doctor</option>
            <option value="hospital">Hospital</option>
          </select>
        </div>
        <div className="form-group">
          <label>Name</label>
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>City</label>
            <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} required />
          </div>
          {form.type === "doctor" ? (
            <div className="form-group">
              <label>Specialty</label>
              <select value={form.specialty} onChange={(e) => setForm({ ...form, specialty: e.target.value })}>
                <option value="general">General Medicine</option>
                <option value="cardiology">Cardiology</option>
                <option value="neurology">Neurology</option>
                <option value="pediatrics">Pediatrics</option>
              </select>
            </div>
          ) : (
            <div className="form-group">
              <label>Address</label>
              <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            </div>
          )}
        </div>
        {form.type === "doctor" && (
          <div className="form-group">
            <label>Bio</label>
            <textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} rows="2" />
          </div>
        )}
        <button type="submit" className="btn-primary">Add Entry</button>
      </form>

      <div className="admin-stats">
        <div className="stat-card"><h3>{doctors.length}</h3><p>Doctors</p></div>
        <div className="stat-card"><h3>{hospitals.length}</h3><p>Hospitals</p></div>
      </div>
    </div>
  );
}
