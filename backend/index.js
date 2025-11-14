// backend/index.js
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();

const healthRoutes = require("./routes/healthRoutes");
const blockchainClient = require("./blockchainClient");
const ipfsClient = require("./ipfsClient");

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.get("/", (req, res) => res.send("CareVault Backend Running 🚀"));
app.use("/api/health", healthRoutes);

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    // Initialize blockchain client and ipfs client, but allow startup if these fail
    try {
      await blockchainClient.init();
    } catch (e) {
      console.warn("Warning: blockchain client init failed (you can still start backend):", e.message);
    }
    try {
      ipfsClient.init();
    } catch (e) {
      console.warn("Warning: ipfs client init failed:", e.message);
    }

    app.listen(PORT, () => console.log(`Backend listening on port ${PORT}`));
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
}

start();

