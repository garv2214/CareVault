const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();

const { load } = require("./db/database");
const blockchainClient = require("./blockchainClient");
const ipfsClient = require("./ipfsClient");

const authRoutes = require("./routes/authRoutes");
const healthRoutes = require("./routes/healthRoutes");
const aiRoutes = require("./routes/aiRoutes");
const providerRoutes = require("./routes/providerRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes");
const contentRoutes = require("./routes/contentRoutes");

const app = express();

// Security headers middleware
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  next();
});

// Simple in-memory rate limiter for auth routes
const rateLimitMap = new Map();
function rateLimiter(limit = 100, windowMs = 15 * 60 * 1000) {
  return (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress || "unknown";
    const now = Date.now();
    const clientData = rateLimitMap.get(ip) || { count: 0, startTime: now };

    if (now - clientData.startTime > windowMs) {
      clientData.count = 1;
      clientData.startTime = now;
    } else {
      clientData.count += 1;
    }
    rateLimitMap.set(ip, clientData);

    if (clientData.count > limit) {
      return res.status(429).json({ success: false, message: "Too many requests. Please try again later." });
    }
    next();
  };
}

app.use(cors());
app.use(bodyParser.json({ limit: "2mb" }));

// Rate limit on sensitive routes
app.use("/api/auth/send-otp", rateLimiter(10, 5 * 60 * 1000)); // 10 requests per 5 mins

app.get("/", (req, res) => res.json({
  name: "CareVault Backend",
  status: "running",
  version: "2.0.0",
  modules: ["auth", "health", "ai", "providers", "appointments", "content"],
}));

app.use("/api/auth", authRoutes);
app.use("/api/health", healthRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/providers", providerRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/content", contentRoutes);

// Global 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.url}` });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
  });
});

const PORT = process.env.PORT || 5000;

let server = null;

async function start() {
  load();
  if (process.env.NODE_ENV !== "test") {
    console.log("📦 Database loaded");
  }

  try { await blockchainClient.init(); } catch (e) {
    if (process.env.NODE_ENV !== "test") {
      console.warn("⚠️ Blockchain init failed (backend still starts):", e.message);
    }
  }
  try { await ipfsClient.init(); } catch (e) {
    if (process.env.NODE_ENV !== "test") {
      console.warn("⚠️ IPFS init failed (backend still starts):", e.message);
    }
  }

  if (process.env.NODE_ENV !== "test") {
    server = app.listen(PORT, () => console.log(`🚀 CareVault Backend listening on port ${PORT}`));
  }
  return app;
}

if (require.main === module) {
  start();
}

module.exports = { app, start };
