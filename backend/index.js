// backend/index.js

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();

const healthRoutes = require("./routes/healthRoutes");
const blockchainClient = require("./blockchainClient");
const ipfsClient = require("./ipfsClient");
const aiRoutes = require("./routes/aiRoutes");

// Initialize express BEFORE using routes
const app = express();

// CORS Configuration for macOS M1 compatibility
const corsOptions = {
  origin: process.env.CORS_ORIGIN || ["http://localhost:3000", "http://localhost:3001"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"]
};

// Middlewares
app.use(cors(corsOptions));
app.use(bodyParser.json());

// Enhanced logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path} - ${req.ip}`);
  next();
});

// Routes
app.get("/", (req, res) => {
  console.log("GET / HIT - CareVault Backend Running 🚀");
  res.json({
    status: "running",
    message: "CareVault Backend Running 🚀",
    timestamp: new Date().toISOString(),
    version: "1.0.0"
  });
});

app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    services: {
      blockchain: blockchainClient ? "connected" : "disconnected",
      ipfs: ipfsClient ? "connected" : "disconnected"
    }
  });
});

app.use("/api/health", healthRoutes);
app.use("/api/ai", aiRoutes);      // <-- moved **after app is defined**


const PORT = process.env.PORT || 7001;

async function start() {
  try {
    // Initialize blockchain client and IPFS (non-blocking)nano .env

    try {
      await blockchainClient.init();
    } catch (e) {
      console.warn(
        "⚠️ Warning: blockchain client init failed (backend still starts):",
        e.message
      );
    }

    try {
      await ipfsClient.init();
    } catch (e) {
      console.warn(
        "⚠️ Warning: IPFS client init failed (backend still starts):",
        e.message
      );
    }

    // Start server
    app.listen(PORT, () =>
      console.log(`🚀 Backend listening on port ${PORT}`)
    );
  } catch (err) {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
  }
}

start();
