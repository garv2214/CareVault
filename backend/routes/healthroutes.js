const express = require("express");
const router = express.Router();

// Controller functions
const {
  getAllRecords,
  addRecord,
  getEmergencySummary,
  getRecordsByPatient,
  requestAccess,
  triggerEmergency,
} = require("../controllers/healthcontroller_fixed");

// Routes
router.get("/", getAllRecords);
router.post("/", addRecord);
router.get("/emergency/:patientId", getEmergencySummary);
router.get("/records/:patientId", getRecordsByPatient);
router.post("/access/request", requestAccess);
router.post("/emergency", triggerEmergency);

module.exports = router;
