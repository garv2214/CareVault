import React, { useState } from "react";
import { api } from "../services/api";

export default function ProfileSetup({ phone, onComplete }) {
  const [form, setForm] = useState({ name: "", role: "patient", city: "", walletAddress: "" });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name) return alert("Name is required");
    setLoading(true);
    try {
      const res = await api.register({ phone, ...form });
      api.setToken(res.token);
      api.setUser(res.user);
      onComplete(res.user);
    } catch (err) {
      alert("Registration failed: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-card">
      <h2>Complete Your Profile</h2>
      <p className="auth-subtitle">Set up your CareVault account</p>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Full Name</label>
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        </div>
        <div className="form-group">
          <label>I am a</label>
          <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
            <option value="patient">Patient</option>
            <option value="doctor">Doctor</option>
            <option value="admin">Administrator</option>
          </select>
        </div>
        <div className="form-group">
          <label>City</label>
          <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="e.g., Mumbai" />
        </div>
        <div className="form-group">
          <label>Wallet Address (optional)</label>
          <input value={form.walletAddress} onChange={(e) => setForm({ ...form, walletAddress: e.target.value })} placeholder="0x..." />
        </div>
        <button type="submit" className="btn-primary btn-full" disabled={loading}>
          {loading ? "Creating..." : "Create Account"}
        </button>
      </form>
    </div>
  );
}
