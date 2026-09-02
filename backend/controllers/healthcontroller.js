const { getDb, save, generateId } = require("../db/database");
const { triggerEmergencyAlerts } = require("../services/notificationService");
const ipfsClient = require("../ipfsClient");
const blockchainClient = require("../blockchainClient");
const { encrypt, decrypt, contentHash } = require("../utils/encrypt");
const axios = require("axios");

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:8000";

exports.getAllRecords = (req, res) => {
  const db = getDb();
  const { patientId } = req.query;
  let records = db.healthRecords;
  if (patientId) records = records.filter((r) => r.patientId === patientId);
  if (req.user && req.user.role === "patient") {
    records = records.filter((r) => r.patientId === req.user.patientId);
  }
  return res.json({ success: true, data: records });
};

exports.addRecord = async (req, res) => {
  try {
    const { patientId, recordData } = req.body;
    if (!patientId || !recordData) {
      return res.status(400).json({ success: false, message: "Missing patientId or recordData" });
    }

    const encrypted = encrypt(recordData);
    const hash = contentHash(JSON.stringify(recordData));

    await ipfsClient.init();
    const ipfsHash = await ipfsClient.uploadJSON({
      patientId,
      payload: encrypted,
      contentHash: hash,
      timestamp: new Date().toISOString(),
    });

    const localEntry = {
      id: generateId("rec"),
      patientId,
      ipfsHash,
      contentHash: hash,
      uploadedAt: new Date().toISOString(),
      uploadedBy: req.user?.id || "anonymous",
    };

    const db = getDb();
    db.healthRecords.push(localEntry);
    save();

    let txHash = null;
    try {
      await blockchainClient.init();
      const receipt = await blockchainClient.addHealthRecord(patientId, ipfsHash, hash);
      txHash = receipt.transactionHash || null;
    } catch (e) {
      console.warn("Blockchain write skipped:", e.message);
    }

    return res.status(201).json({
      success: true,
      message: "Record stored on IPFS and on-chain",
      ipfsHash,
      contentHash: hash,
      txHash,
      record: localEntry,
    });
  } catch (err) {
    console.error("addRecord error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.getEmergencySummary = async (req, res) => {
  try {
    const { patientId } = req.params;
    const db = getDb();
    const entries = db.healthRecords.filter((r) => r.patientId === patientId);
    if (entries.length === 0) {
      return res.status(404).json({ success: false, message: "No records found" });
    }

    const latest = entries[entries.length - 1];
    let decrypted = null;
    let aiSummary = null;

    try {
      const gatewayUrl = `https://ipfs.io/ipfs/${latest.ipfsHash}`;
      const resp = await axios.get(gatewayUrl, { timeout: 10000 });
      const { payload } = resp.data || {};
      decrypted = payload ? decrypt(payload) : null;
    } catch {
      decrypted = { note: "Could not fetch from IPFS gateway" };
    }

    try {
      const aiResp = await axios.post(`${AI_SERVICE_URL}/predict`, decrypted || {}, { timeout: 5000 });
      aiSummary = aiResp.data;
    } catch {
      aiSummary = { prediction: "STABLE", risk_level: "UNKNOWN", note: "AI service unavailable" };
    }

    const summary = {
      patientId,
      ipfsCid: latest.ipfsHash,
      contentHash: latest.contentHash,
      decryptedSample: decrypted,
      aiAssessment: aiSummary,
      quickSummary: aiSummary?.prediction === "EMERGENCY"
        ? `CRITICAL: ${aiSummary.risk_level} risk detected. Immediate attention required.`
        : `Patient ${patientId} — vitals reviewed. Status: ${aiSummary?.prediction || "STABLE"}.`,
      emergencyContacts: db.emergencyContacts.filter((c) => c.patientId === patientId),
    };

    return res.json({ success: true, summary });
  } catch (err) {
    console.error("getEmergencySummary error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.triggerEmergency = async (req, res) => {
  const { patientId, reason, location } = req.body;
  if (!patientId || !reason) {
    return res.status(400).json({ success: false, message: "patientId and reason required" });
  }
  const result = await triggerEmergencyAlerts(patientId, reason, location);
  const db = getDb();
  db.auditLog = db.auditLog || [];
  db.auditLog.push({
    id: generateId("audit"),
    patientId,
    action: "EMERGENCY_TRIGGERED",
    reason,
    location,
    timestamp: new Date().toISOString(),
    triggeredBy: req.user?.id || "anonymous",
  });
  save();
  return res.json({ success: true, ...result });
};

exports.addEmergencyContact = (req, res) => {
  const { patientId, name, phone, relationship } = req.body;
  if (!patientId || !name || !phone) {
    return res.status(400).json({ success: false, message: "patientId, name, and phone required" });
  }
  const db = getDb();
  const contact = { id: generateId("ec"), patientId, name, phone, relationship: relationship || "contact" };
  db.emergencyContacts.push(contact);
  save();
  return res.status(201).json({ success: true, contact });
};

exports.getEmergencyContacts = (req, res) => {
  const db = getDb();
  const contacts = db.emergencyContacts.filter((c) => c.patientId === req.params.patientId);
  return res.json({ success: true, data: contacts });
};

exports.grantAccessOnChain = async (req, res) => {
  try {
    const { patientId, granteeAddress, expiresAt } = req.body;
    await blockchainClient.init();
    const receipt = await blockchainClient.grantAccess(patientId, granteeAddress, expiresAt || 0);
    return res.json({ success: true, txHash: receipt.transactionHash });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.getAuditLog = async (req, res) => {
  try {
    const { patientId } = req.params;
    await blockchainClient.init();
    const logs = await blockchainClient.getAuditLog(patientId);
    return res.json({ success: true, data: logs });
  } catch (err) {
    const db = getDb();
    const logs = (db.auditLog || []).filter((l) => l.patientId === patientId);
    return res.json({ success: true, data: logs, source: "local" });
  }
};
