const axios = require("axios");

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:8000";

exports.getPrediction = async (req, res) => {
  try {
    const vitals = req.body;
    const response = await axios.post(`${AI_SERVICE_URL}/predict`, vitals, { timeout: 10000 });
    return res.json({ success: true, prediction: response.data });
  } catch (err) {
    console.error("AI prediction error:", err.message);
    // Fallback rule-based prediction when AI service is down
    const fallback = computeFallbackPrediction(req.body);
    return res.json({ success: true, prediction: fallback, source: "fallback" });
  }
};

exports.classify = async (req, res) => {
  try {
    const response = await axios.post(`${AI_SERVICE_URL}/classify`, req.body, { timeout: 10000 });
    return res.json({ success: true, result: response.data });
  } catch (err) {
    return res.status(503).json({ success: false, message: "AI classification service unavailable" });
  }
};

exports.federatedStatus = async (req, res) => {
  try {
    const response = await axios.get(`${AI_SERVICE_URL}/federated/status`, { timeout: 5000 });
    return res.json({ success: true, status: response.data });
  } catch (err) {
    return res.json({ success: true, status: { round: 0, nodes: 0, note: "AI service offline" } });
  }
};

function computeFallbackPrediction(vitals) {
  let risk = 0;
  const hr = vitals.heart_rate || vitals.heartRate || 80;
  const sys = vitals.systolic_bp || vitals.blood_pressure_systolic || 120;
  const o2 = vitals.oxygen_saturation || 98;
  const temp = vitals.temperature || 37.0;
  const pain = vitals.pain_level || 0;
  const consciousness = vitals.consciousness_score !== undefined ? vitals.consciousness_score : 10;

  if (hr > 120 || hr < 50) risk += 0.2;
  if (sys > 180 || sys < 90) risk += 0.25;
  if (o2 < 92) risk += 0.3;
  if (temp > 38.5 || temp < 36.0) risk += 0.15;
  if (pain >= 8) risk += 0.15;
  if (consciousness < 7) risk += 0.25;

  const score = Math.min(risk, 1.0);
  const prediction = score > 0.5 ? "EMERGENCY" : "STABLE";
  const level = score > 0.8 ? "CRITICAL" : score > 0.6 ? "HIGH" : score > 0.4 ? "MODERATE" : "LOW";

  return {
    risk_score: score,
    risk_level: level,
    prediction: prediction,
    risk_label: prediction,
    risk_probability: score,
    confidence: 0.75 + score * 0.2,
    source: "backend-fallback",
  };
}
