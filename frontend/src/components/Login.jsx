import React, { useState } from "react";
import { api } from "../services/api";

export default function Login({ onOtpSent }) {
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [devOtp, setDevOtp] = useState("");

  async function handleSendOtp(e) {
    e.preventDefault();
    if (phone.length < 10) return alert("Enter a valid 10-digit phone number");
    setLoading(true);
    try {
      const res = await api.sendOtp(phone);
      if (res.devOtp) setDevOtp(res.devOtp);
      onOtpSent(phone);
    } catch (err) {
      alert("Failed to send OTP: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-card">
      <h2>Welcome to CareVault</h2>
      <p className="auth-subtitle">Enter your mobile number to get started</p>
      <form onSubmit={handleSendOtp}>
        <div className="form-group">
          <label>Mobile Number</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
            placeholder="10-digit mobile number"
            required
          />
        </div>
        <button type="submit" className="btn-primary btn-full" disabled={loading}>
          {loading ? "Sending..." : "Send OTP"}
        </button>
      </form>
      {devOtp && <p className="dev-otp">Dev OTP: <strong>{devOtp}</strong></p>}
    </div>
  );
}
