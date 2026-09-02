import React, { useState } from "react";
import { api } from "../services/api";

export default function OTPVerify({ phone, onVerified, onBack }) {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleVerify(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.verifyOtp(phone, otp);
      if (res.isNewUser) {
        onVerified({ isNewUser: true, phone });
      } else {
        api.setToken(res.token);
        api.setUser(res.user);
        onVerified({ isNewUser: false, user: res.user, token: res.token });
      }
    } catch (err) {
      alert("Verification failed: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-card">
      <h2>Verify OTP</h2>
      <p className="auth-subtitle">Enter the 6-digit code sent to {phone}</p>
      <form onSubmit={handleVerify}>
        <div className="form-group">
          <label>One-Time Password</label>
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
            placeholder="6-digit OTP"
            maxLength={6}
            required
          />
        </div>
        <button type="submit" className="btn-primary btn-full" disabled={loading}>
          {loading ? "Verifying..." : "Verify & Continue"}
        </button>
        <button type="button" className="btn-link" onClick={onBack}>Change number</button>
      </form>
    </div>
  );
}
