const express = require("express");
const router = express.Router();
const {
  getDoctors, getDoctor, getHospitals, getSpecialties, getSlots, addDoctor, addHospital, manageSlots,
} = require("../controllers/providerController");
const { authMiddleware, requireRole } = require("../middleware/auth");

router.get("/doctors", getDoctors);
router.get("/doctors/:id", getDoctor);
router.get("/hospitals", getHospitals);
router.get("/specialties", getSpecialties);
router.get("/slots", getSlots);
router.post("/doctors", authMiddleware, requireRole("admin"), addDoctor);
router.post("/hospitals", authMiddleware, requireRole("admin"), addHospital);
router.post("/slots", authMiddleware, requireRole("doctor", "admin"), manageSlots);

module.exports = router;
