// backend/controllers/healthController.js
const ipfsClient = require("../ipfsClient");
const blockchainClient = require("../blockchainClient");
const { encrypt, decrypt } = require("../utils/encrypt");

// Temporary in-memory DB (you should use real DB e.g., MongoDB)
let recordsDB = [];

exports.getAllRecords = (req, res) => {
  res.json({ success: true, data: recordsDB });
};

exports.addRecord = async (req, res) => {
  try {
    const { patientId, recordData } = req.body;
    if (!patientId || !recordData) {
      return res.status(400).json({ success: false, message: "Missing patientId or recordData" });
    }

    // 1) encrypt the record
    const encrypted = encrypt(recordData);

    // 2) upload to IPFS
    ipfsClient.init();
    const ipfsHash = await ipfsClient.uploadJSON({
      patientId,
      payload: encrypted,
      timestamp: new Date().toISOString(),
    });

    // 3) save locally (or in DB) the mapping + ipfsHash
    const localEntry = { patientId, ipfsHash, uploadedAt: new Date() };
    recordsDB.push(localEntry);

    // 4) add metadata on-chain
    await blockchainClient.init();
    const receipt = await blockchainClient.addHealthRecord(patientId, ipfsHash);

    return res.status(201).json({
      success: true,
      message: "Record stored on IPFS and on-chain",
      ipfsHash,
      txHash: receipt.transactionHash || receipt.transactionHash || null,
    });
  } catch (err) {
    console.error("addRecord error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.getEmergencySummary = async (req, res) => {
  try {
    const { patientId } = req.params;
    // find last record ipfsHash (in-memory)
    const entries = recordsDB.filter((r) => r.patientId === patientId);
    if (entries.length === 0) return res.status(404).json({ success: false, message: "No records found" });

    const latest = entries[entries.length - 1];

    // Download IPFS content via public gateway (simple approach)
    // If using ipfs client, you can `cat` the CID to get bytes
    const ipfsCid = latest.ipfsHash;
    const gatewayUrl = `https://ipfs.io/ipfs/${ipfsCid}`;

    // try to fetch content
    const axios = require("axios");
    const resp = await axios.get(gatewayUrl, { timeout: 10000 });
    const { payload } = resp.data || {};
    const decrypted = payload ? decrypt(payload) : { note: "Could not fetch/decrypt" };

    // In real flow, call AI microservice for emergency summarization (not implemented here)
    const summary = {
      patientId,
      ipfsCid,
      decryptedSample: decrypted,
      quickSummary: "Placeholder emergency summary - extend with AI",
    };

    return res.json({ success: true, summary });
  } catch (err) {
    console.error("getEmergencySummary error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};
