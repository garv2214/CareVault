const express = require("express");
const router = express.Router();
const {
  bookAppointment, getAppointments, cancelAppointment, getDoctorSchedule,
} = require("../controllers/appointmentController");
const { authMiddleware } = require("../middleware/auth");

router.post("/book", authMiddleware, bookAppointment);
router.get("/", authMiddleware, getAppointments);
router.delete("/:id", authMiddleware, cancelAppointment);
router.get("/schedule/:doctorId", authMiddleware, getDoctorSchedule);

module.exports = router;
