const { getDb, save, generateId } = require("../db/database");
const { sendOTP, verifyOTP } = require("../services/otpService");
const { createToken } = require("../middleware/auth");

exports.sendOtp = (req, res) => {
  const { phone } = req.body;
  if (!phone || phone.length < 10) {
    return res.status(400).json({ success: false, message: "Valid phone number required" });
  }
  const result = sendOTP(phone);
  return res.json(result);
};

exports.verifyOtp = (req, res) => {
  const { phone, otp } = req.body;
  if (!phone || !otp) {
    return res.status(400).json({ success: false, message: "Phone and OTP required" });
  }
  const result = verifyOTP(phone, otp);
  if (!result.valid) {
    return res.status(401).json({ success: false, message: result.message });
  }
  const db = getDb();
  const existing = db.users.find((u) => u.phone === phone);
  if (existing) {
    const token = createToken({ id: existing.id, phone, role: existing.role, patientId: existing.patientId });
    return res.json({ success: true, isNewUser: false, user: existing, token });
  }
  return res.json({ success: true, isNewUser: true, phone, message: "OTP verified. Complete profile setup." });
};

exports.register = (req, res) => {
  const { phone, name, role, walletAddress, city, patientId } = req.body;
  if (!phone || !name || !role) {
    return res.status(400).json({ success: false, message: "Phone, name, and role required" });
  }
  const db = getDb();
  if (db.users.find((u) => u.phone === phone)) {
    return res.status(409).json({ success: false, message: "User already registered" });
  }
  const user = {
    id: generateId("user"),
    phone,
    name,
    role,
    walletAddress: walletAddress || "",
    city: city || "",
    patientId: role === "patient" ? (patientId || `patient-${Date.now()}`) : "",
    doctorId: role === "doctor" ? `doc-${Date.now()}` : "",
    createdAt: new Date().toISOString(),
  };
  db.users.push(user);
  save();
  const token = createToken({ id: user.id, phone, role: user.role, patientId: user.patientId });
  return res.status(201).json({ success: true, user, token });
};

exports.getProfile = (req, res) => {
  const db = getDb();
  const user = db.users.find((u) => u.id === req.user.id);
  if (!user) return res.status(404).json({ success: false, message: "User not found" });
  return res.json({ success: true, user });
};

exports.updateProfile = (req, res) => {
  const db = getDb();
  const idx = db.users.findIndex((u) => u.id === req.user.id);
  if (idx === -1) return res.status(404).json({ success: false, message: "User not found" });
  const allowed = ["name", "city", "walletAddress", "patientId"];
  for (const key of allowed) {
    if (req.body[key] !== undefined) db.users[idx][key] = req.body[key];
  }
  save();
  return res.json({ success: true, user: db.users[idx] });
};
