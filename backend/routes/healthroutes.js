const express = require("express");
const router = express.Router();
const {
  getAllRecords, addRecord, getEmergencySummary, triggerEmergency,
  addEmergencyContact, getEmergencyContacts, grantAccessOnChain, getAuditLog,
} = require("../controllers/healthController");
const { authMiddleware, optionalAuth } = require("../middleware/auth");

router.get("/", optionalAuth, getAllRecords);
router.post("/", optionalAuth, addRecord);
router.get("/emergency/:patientId", authMiddleware, getEmergencySummary);
router.post("/emergency/trigger", authMiddleware, triggerEmergency);
router.post("/emergency-contacts", authMiddleware, addEmergencyContact);
router.get("/emergency-contacts/:patientId", authMiddleware, getEmergencyContacts);
router.post("/grant-access", authMiddleware, grantAccessOnChain);
router.get("/audit/:patientId", authMiddleware, getAuditLog);

module.exports = router;
