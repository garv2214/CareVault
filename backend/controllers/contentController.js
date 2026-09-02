const { getDb, save, generateId } = require("../db/database");

exports.getMedications = (req, res) => {
  const db = getDb();
  const { patientId } = req.query;
  let meds = db.medications;
  if (patientId) meds = meds.filter((m) => m.patientId === patientId);
  return res.json({ success: true, data: meds });
};

exports.addMedication = (req, res) => {
  const { patientId, name, dosage, frequency, times, startDate, endDate, notes } = req.body;
  if (!patientId || !name || !dosage) {
    return res.status(400).json({ success: false, message: "patientId, name, and dosage required" });
  }
  const db = getDb();
  const med = {
    id: generateId("med"),
    patientId,
    name,
    dosage,
    frequency: frequency || "daily",
    times: times || ["08:00"],
    startDate: startDate || new Date().toISOString().split("T")[0],
    endDate: endDate || "",
    notes: notes || "",
    active: true,
    createdAt: new Date().toISOString(),
  };
  db.medications.push(med);
  save();
  return res.status(201).json({ success: true, medication: med });
};

exports.updateMedication = (req, res) => {
  const db = getDb();
  const idx = db.medications.findIndex((m) => m.id === req.params.id);
  if (idx === -1) return res.status(404).json({ success: false, message: "Medication not found" });
  const allowed = ["name", "dosage", "frequency", "times", "startDate", "endDate", "notes", "active"];
  for (const key of allowed) {
    if (req.body[key] !== undefined) db.medications[idx][key] = req.body[key];
  }
  save();
  return res.json({ success: true, medication: db.medications[idx] });
};

exports.deleteMedication = (req, res) => {
  const db = getDb();
  const idx = db.medications.findIndex((m) => m.id === req.params.id);
  if (idx === -1) return res.status(404).json({ success: false, message: "Medication not found" });
  db.medications.splice(idx, 1);
  save();
  return res.json({ success: true, message: "Medication deleted" });
};

exports.getArticles = (req, res) => {
  const db = getDb();
  let articles = [...db.articles];
  if (req.query.category) {
    articles = articles.filter((a) => a.category.toLowerCase() === req.query.category.toLowerCase());
  }
  return res.json({ success: true, data: articles });
};

exports.getArticle = (req, res) => {
  const db = getDb();
  const article = db.articles.find((a) => a.id === req.params.id);
  if (!article) return res.status(404).json({ success: false, message: "Article not found" });
  return res.json({ success: true, article });
};

exports.addArticle = (req, res) => {
  const { title, summary, category, content } = req.body;
  if (!title || !content) return res.status(400).json({ success: false, message: "Title and content required" });
  const db = getDb();
  const article = { id: generateId("art"), title, summary: summary || "", category: category || "General", content };
  db.articles.push(article);
  save();
  return res.status(201).json({ success: true, article });
};

exports.getNotifications = (req, res) => {
  const db = getDb();
  const notifs = db.notifications.filter((n) => n.userId === req.user.id || n.userId === req.user.patientId);
  return res.json({ success: true, data: notifs });
};
