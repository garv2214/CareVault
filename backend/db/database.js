const fs = require("fs");
const path = require("path");

const DB_PATH = path.join(__dirname, "carevault.json");

const DEFAULT_DATA = {
  users: [],
  doctors: [],
  hospitals: [],
  specialties: [
    { id: "cardiology", name: "Cardiology" },
    { id: "neurology", name: "Neurology" },
    { id: "orthopedics", name: "Orthopedics" },
    { id: "pediatrics", name: "Pediatrics" },
    { id: "dermatology", name: "Dermatology" },
    { id: "general", name: "General Medicine" },
  ],
  appointments: [],
  timeSlots: [],
  healthRecords: [],
  medications: [],
  articles: [
    {
      id: "art1",
      title: "Understanding Blood Pressure",
      summary: "Learn what systolic and diastolic numbers mean for your health.",
      category: "Heart Health",
      content: "Blood pressure measures the force of blood against artery walls...",
    },
    {
      id: "art2",
      title: "Diabetes Management Tips",
      summary: "Daily habits that help manage blood sugar levels effectively.",
      category: "Diabetes",
      content: "Regular monitoring, balanced diet, and exercise are key...",
    },
    {
      id: "art3",
      title: "Emergency Preparedness",
      summary: "How to prepare your medical info for emergencies.",
      category: "Emergency",
      content: "Keep emergency contacts updated and carry your patient ID...",
    },
  ],
  emergencyContacts: [],
  notifications: [],
  otpStore: {},
  sessions: {},
};

let data = null;

function load() {
  try {
    if (fs.existsSync(DB_PATH)) {
      const raw = fs.readFileSync(DB_PATH, "utf8");
      data = { ...DEFAULT_DATA, ...JSON.parse(raw) };
    } else {
      data = JSON.parse(JSON.stringify(DEFAULT_DATA));
      seedDoctors();
      save();
    }
  } catch (e) {
    data = JSON.parse(JSON.stringify(DEFAULT_DATA));
    seedDoctors();
    save();
  }
  return data;
}

function save() {
  if (!data) return;
  try {
    const tempPath = `${DB_PATH}.tmp.${Date.now()}`;
    fs.writeFileSync(tempPath, JSON.stringify(data, null, 2));
    fs.renameSync(tempPath, DB_PATH);
  } catch (err) {
    // Fallback direct write
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
  }
}

function resetDb() {
  data = JSON.parse(JSON.stringify(DEFAULT_DATA));
  seedDoctors();
  save();
  return data;
}

function seedDoctors() {
  const cities = ["Mumbai", "Delhi", "Bangalore", "Chennai", "Hyderabad"];
  const specs = data.specialties;
  data.doctors = [];
  data.hospitals = [
    { id: "hosp1", name: "Apollo Hospital", city: "Mumbai", address: "Plot 13, Mumbai" },
    { id: "hosp2", name: "Fortis Healthcare", city: "Delhi", address: "Sector 62, Noida" },
    { id: "hosp3", name: "Manipal Hospital", city: "Bangalore", address: "HAL Airport Road" },
    { id: "hosp4", name: "MIOT International", city: "Chennai", address: "Chennai Bypass" },
    { id: "hosp5", name: "Yashoda Hospital", city: "Hyderabad", address: "Malakpet" },
  ];
  for (let i = 1; i <= 12; i++) {
    const spec = specs[i % specs.length];
    const city = cities[i % cities.length];
    const doctorId = `doc-${String(i).padStart(3, "0")}`;
    data.doctors.push({
      id: doctorId,
      name: `Dr. ${["Sharma", "Patel", "Kumar", "Singh", "Reddy", "Nair"][i % 6]} ${String.fromCharCode(65 + (i % 26))}.`,
      specialty: spec.id,
      specialtyName: spec.name,
      city,
      hospitalId: data.hospitals[i % data.hospitals.length].id,
      rating: (4 + Math.random()).toFixed(1),
      experience: 5 + (i % 20),
      bio: `Experienced ${spec.name} specialist in ${city}.`,
      walletAddress: "",
    });
    // Generate time slots for next 7 days
    for (let d = 0; d < 7; d++) {
      const date = new Date();
      date.setDate(date.getDate() + d);
      const dateStr = date.toISOString().split("T")[0];
      const times = ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"];
      for (const time of times) {
        data.timeSlots.push({
          id: `slot-${doctorId}-${dateStr}-${time}`,
          doctorId,
          date: dateStr,
          time,
          available: true,
          bookedBy: null,
        });
      }
    }
  }
}

function getDb() {
  if (!data) load();
  return data;
}

function generateId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

module.exports = { load, save, resetDb, getDb, generateId, DB_PATH };
