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

// Middlewares
app.use(cors());
app.use(bodyParser.json());

// Routes
app.get("/", (req, res) => res.send("CareVault Backend Running 🚀"));
app.use("/api/health", healthRoutes);
app.use("/api/ai", aiRoutes);      // <-- moved **after app is defined**

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    // Initialize blockchain client and IPFS (non-blocking)
    try {
      await blockchainClient.init();
    } catch (e) {
      console.warn(
        "⚠️ Warning: blockchain client init failed (backend still starts):",
        e.message
      );
    }

    try {
      ipfsClient.init();
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
