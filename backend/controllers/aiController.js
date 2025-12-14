// backend/controllers/aiController.js
const axios = require("axios");

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:8000";

exports.getPrediction = async (req, res) => {
  try {
    const vitals = req.body;
    
    const response = await axios.post(`${AI_SERVICE_URL}/predict`, vitals);
    
    return res.json({
      success: true,
      prediction: response.data
    });
  } catch (err) {
    console.error("AI prediction error:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "AI service unavailable"
    });
  }
};

