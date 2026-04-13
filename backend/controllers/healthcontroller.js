// backend/controllers/healthController.js
const ipfsClient = require("../ipfsClient");
const blockchainClient = require("../blockchainClient");
const { encrypt, decrypt } = require("../utils/encrypt");
const low = require('lowdb');
const db = low('db.json');

// Initialize DB
function initDB() {
  db.defaults({ records: [], accessRequests: [], emergencyLogs: [] }).write();
}

exports.getAllRecords = async (req, res) => {
  await initDB();
  res.json({ success: true, data: db.data.records });
};

exports.addRecord = async (req, res) => {
  try {
    await initDB();
    const { patientId, recordData } = req.body;
    if (!patientId || !recordData) {
      return res.status(400).json({ success: false, message: "Missing patientId or recordData" });
    }

    // 1) encrypt the record
    const encrypted = encrypt(recordData);

    // 2) upload to IPFS
    await ipfsClient.init();
    const ipfsHash = await ipfsClient.uploadJSON({
      patientId,
      payload: encrypted,
      timestamp: new Date().toISOString(),
    });

    // 3) save locally (or in DB) the mapping + ipfsHash
    const localEntry = { patientId, ipfsHash, uploadedAt: new Date() };
    db.data.records.push(localEntry);
    await db.write();

    // 4) add metadata on-chain
    await blockchainClient.init();
    const receipt = await blockchainClient.addHealthRecord(patientId, ipfsHash);

    return res.status(201).json({
      success: true,
      message: "Record stored on IPFS and on-chain",
      ipfsHash,
      txHash: receipt.transactionHash,
    });
  } catch (err) {
    console.error("addRecord error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.getEmergencySummary = async (req, res) => {
  try {
    await initDB();
    const { patientId } = req.params;
    const entries = db.data.records.filter((r) => r.patientId === patientId);
    if (entries.length === 0) return res.status(404).json({ success: false, message: "No records found" });

    const latest = entries[entries.length - 1];

    const ipfsCid = latest.ipfsHash;
    const gatewayUrl = `https://ipfs.io/ipfs/${ipfsCid}`;

    const axios = require("axios");
    const resp = await axios.get(gatewayUrl, { timeout: 10000 });
    const { payload } = resp.data || {};
    const decrypted = payload ? decrypt(payload) : { note: "Could not fetch/decrypt" };

    const summary = {
      patientId,
      ipfsCid,
      decryptedSample: decrypted,
      quickSummary: "AI-powered emergency summary (extend with /api/ai)",
    };

    return res.json({ success: true, summary });
  } catch (err) {
    console.error("getEmergencySummary error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.getRecordsByPatient = async (req, res) => {
  try {
    await initDB();
    const { patientId } = req.params;
    const entries = db.data.records.filter(r => r.patientId === patientId);
    res.json({ success: true, records: entries });
  } catch (err) {
    console.error("getRecordsByPatient error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.requestAccess = async (req, res) => {
  try {
    await initDB();
    const { patientId, doctorAddress, purpose } = req.body;
    if (!patientId || !doctorAddress || !purpose) {
      return res.status(400).json({ success: false, message: "Missing patientId, doctorAddress or purpose" });
    }
    const request = {
      id: Date.now(),
      patientId,
      doctorAddress,
      purpose,
      status: 'pending',
      requestedAt: new Date().toISOString()
    };
    db.data.accessRequests.push(request);
    await db.write();
    res.json({ success: true, requestId: request.id, message: 'Access request created' });
  } catch (err) {
    console.error("requestAccess error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.triggerEmergency = async (req, res) => {
  try {
    await initDB();
    const { patientId, reason } = req.body;
    if (!patientId || !reason) {
      return res.status(400).json({ success: false, message: "Missing patientId or reason" });
    }

    await blockchainClient.init();
    const receipt = await blockchainClient.contract.emergencyAccess(patientId, reason);
    const tx = await receipt.wait();

    const log = {
      patientId,
      accessor: blockchainClient.signer.address,
      reason,
      txHash: tx.transactionHash,
      timestamp: new Date().toISOString()
    };
    db.data.emergencyLogs.push(log);
    await db.write();

    res.json({ success: true, txHash: tx.transactionHash, message: 'Emergency access logged on-chain' });
  } catch (err) {
    console.error("triggerEmergency error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};
