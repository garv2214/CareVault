const { getDb, save } = require("../db/database");

const OTP_EXPIRY_MS = 5 * 60 * 1000;

function generateOTP() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function sendOTP(phone) {
  const db = getDb();
  const otp = generateOTP();
  db.otpStore[phone] = { otp, expiresAt: Date.now() + OTP_EXPIRY_MS };
  save();
  // In production: integrate Twilio/Firebase. For dev, log OTP to server console only.
  if (process.env.NODE_ENV !== "test") {
    console.log(`📱 OTP for ${phone}: ${otp} (valid 5 min)`);
  }
  return { success: true, message: "OTP sent successfully" };
}

function verifyOTP(phone, otp) {
  const db = getDb();
  const entry = db.otpStore[phone];
  if (!entry) return { valid: false, message: "No OTP requested for this number" };
  if (Date.now() > entry.expiresAt) {
    delete db.otpStore[phone];
    save();
    return { valid: false, message: "OTP expired" };
  }
  if (entry.otp !== otp) return { valid: false, message: "Invalid OTP" };
  delete db.otpStore[phone];
  save();
  return { valid: true };
}

module.exports = { sendOTP, verifyOTP };
