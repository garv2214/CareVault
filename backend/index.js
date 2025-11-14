const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();

// Routes
const healthRoutes = require("./routes/healthRoutes");

const app = express();

// Middlewares
app.use(cors());
app.use(bodyParser.json());

// Default Route
app.get("/", (req, res) => {
  res.send("CareVault Backend Running Successfully 🚀");
});

// Use routes
app.use("/api/health", healthRoutes);

// Server Start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
