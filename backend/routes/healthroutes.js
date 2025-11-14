const express = require("express");
const router = express.Router();

// Controller functions
const {
  getAllRecords,
  addRecord,
  getEmergencySummary,
} = require("../controllers/healthController");

// Routes
router.get("/", getAllRecords);
router.post("/", addRecord);
router.get("/emergency/:patientId", getEmergencySummary);

module.exports = router;
