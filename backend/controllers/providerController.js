const { getDb, save, generateId } = require("../db/database");

exports.getDoctors = (req, res) => {
  const db = getDb();
  let doctors = [...db.doctors];
  const { specialty, city, search } = req.query;
  if (specialty) doctors = doctors.filter((d) => d.specialty === specialty);
  if (city) doctors = doctors.filter((d) => d.city.toLowerCase() === city.toLowerCase());
  if (search) {
    const q = search.toLowerCase();
    doctors = doctors.filter(
      (d) => d.name.toLowerCase().includes(q) || d.specialtyName.toLowerCase().includes(q) || d.city.toLowerCase().includes(q)
    );
  }
  return res.json({ success: true, data: doctors });
};

exports.getDoctor = (req, res) => {
  const db = getDb();
  const doctor = db.doctors.find((d) => d.id === req.params.id);
  if (!doctor) return res.status(404).json({ success: false, message: "Doctor not found" });
  const hospital = db.hospitals.find((h) => h.id === doctor.hospitalId);
  const slots = db.timeSlots.filter((s) => s.doctorId === doctor.id && s.available);
  return res.json({ success: true, doctor, hospital, availableSlots: slots.length });
};

exports.getHospitals = (req, res) => {
  const db = getDb();
  let hospitals = [...db.hospitals];
  if (req.query.city) {
    hospitals = hospitals.filter((h) => h.city.toLowerCase() === req.query.city.toLowerCase());
  }
  return res.json({ success: true, data: hospitals });
};

exports.getSpecialties = (req, res) => {
  const db = getDb();
  return res.json({ success: true, data: db.specialties });
};

exports.getSlots = (req, res) => {
  const db = getDb();
  const { doctorId, date } = req.query;
  let slots = db.timeSlots.filter((s) => s.available);
  if (doctorId) slots = slots.filter((s) => s.doctorId === doctorId);
  if (date) slots = slots.filter((s) => s.date === date);
  return res.json({ success: true, data: slots });
};

exports.addDoctor = (req, res) => {
  const { name, specialty, city, hospitalId, bio, walletAddress } = req.body;
  if (!name || !specialty || !city) {
    return res.status(400).json({ success: false, message: "Name, specialty, and city required" });
  }
  const db = getDb();
  const spec = db.specialties.find((s) => s.id === specialty);
  const doctor = {
    id: generateId("doc"),
    name,
    specialty,
    specialtyName: spec ? spec.name : specialty,
    city,
    hospitalId: hospitalId || "",
    rating: "4.5",
    experience: 5,
    bio: bio || "",
    walletAddress: walletAddress || "",
  };
  db.doctors.push(doctor);
  save();
  return res.status(201).json({ success: true, doctor });
};

exports.addHospital = (req, res) => {
  const { name, city, address } = req.body;
  if (!name || !city) return res.status(400).json({ success: false, message: "Name and city required" });
  const db = getDb();
  const hospital = { id: generateId("hosp"), name, city, address: address || "" };
  db.hospitals.push(hospital);
  save();
  return res.status(201).json({ success: true, hospital });
};

exports.manageSlots = (req, res) => {
  const { doctorId, date, times } = req.body;
  if (!doctorId || !date || !times || !times.length) {
    return res.status(400).json({ success: false, message: "doctorId, date, and times required" });
  }
  const db = getDb();
  const created = [];
  for (const time of times) {
    const slot = {
      id: `slot-${doctorId}-${date}-${time}`,
      doctorId,
      date,
      time,
      available: true,
      bookedBy: null,
    };
    if (!db.timeSlots.find((s) => s.id === slot.id)) {
      db.timeSlots.push(slot);
      created.push(slot);
    }
  }
  save();
  return res.json({ success: true, created });
};
