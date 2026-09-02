const { getDb, save, generateId } = require("../db/database");
const { sendNotification } = require("../services/notificationService");

exports.bookAppointment = (req, res) => {
  const { doctorId, slotId, patientId, notes } = req.body;
  if (!doctorId || !slotId || !patientId) {
    return res.status(400).json({ success: false, message: "doctorId, slotId, and patientId required" });
  }

  const db = getDb();
  const slotIdx = db.timeSlots.findIndex((s) => s.id === slotId);
  if (slotIdx === -1) {
    return res.status(404).json({ success: false, message: "Slot not found" });
  }

  const slot = db.timeSlots[slotIdx];
  if (!slot.available || slot.bookedBy) {
    return res.status(409).json({ success: false, message: "Slot already booked — double-booking prevented" });
  }

  const doctor = db.doctors.find((d) => d.id === doctorId);
  if (!doctor) return res.status(404).json({ success: false, message: "Doctor not found" });

  // Atomic lock: mark slot unavailable first
  db.timeSlots[slotIdx].available = false;
  db.timeSlots[slotIdx].bookedBy = patientId;

  const appointment = {
    id: generateId("appt"),
    doctorId,
    doctorName: doctor.name,
    patientId,
    slotId,
    date: slot.date,
    time: slot.time,
    status: "confirmed",
    notes: notes || "",
    createdAt: new Date().toISOString(),
  };
  db.appointments.push(appointment);
  save();

  sendNotification({
    userId: patientId,
    type: "appointment",
    title: "Appointment Confirmed",
    message: `Booked with ${doctor.name} on ${slot.date} at ${slot.time}`,
  });

  return res.status(201).json({ success: true, appointment });
};

exports.getAppointments = (req, res) => {
  const db = getDb();
  const { patientId, doctorId, status } = req.query;
  let appointments = [...db.appointments];
  if (patientId) appointments = appointments.filter((a) => a.patientId === patientId);
  if (doctorId) appointments = appointments.filter((a) => a.doctorId === doctorId);
  if (status) appointments = appointments.filter((a) => a.status === status);
  appointments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return res.json({ success: true, data: appointments });
};

exports.cancelAppointment = (req, res) => {
  const db = getDb();
  const idx = db.appointments.findIndex((a) => a.id === req.params.id);
  if (idx === -1) return res.status(404).json({ success: false, message: "Appointment not found" });

  const appt = db.appointments[idx];
  if (appt.status === "cancelled") {
    return res.status(400).json({ success: false, message: "Already cancelled" });
  }

  db.appointments[idx].status = "cancelled";
  const slotIdx = db.timeSlots.findIndex((s) => s.id === appt.slotId);
  if (slotIdx !== -1) {
    db.timeSlots[slotIdx].available = true;
    db.timeSlots[slotIdx].bookedBy = null;
  }
  save();
  return res.json({ success: true, appointment: db.appointments[idx] });
};

exports.getDoctorSchedule = (req, res) => {
  const db = getDb();
  const { doctorId } = req.params;
  const appointments = db.appointments.filter((a) => a.doctorId === doctorId && a.status === "confirmed");
  const slots = db.timeSlots.filter((s) => s.doctorId === doctorId);
  return res.json({ success: true, appointments, slots });
};
