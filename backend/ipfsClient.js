// backend/ipfsClient.js
const { create } = require("ipfs-http-client");
const axios = require("axios");
require("dotenv").config();

let client = null;

function init() {
  if (client) return client;

  // Default to public Infura endpoint (no auth) or local / custom gateway
  // If you have Infura credentials, we use basic auth
  const projectId = process.env.IPFS_PROJECT_ID || "";
  const projectSecret = process.env.IPFS_PROJECT_SECRET || "";

  if (projectId && projectSecret) {
    const auth = "Basic " + Buffer.from(projectId + ":" + projectSecret).toString("base64");
    client = create({
      host: "ipfs.infura.io",
      port: 5001,
      protocol: "https",
      headers: {
        authorization: auth,
      },
    });
  } else {
    // fallback to public gateway
    client = create({ url: "https://ipfs.infura.io:5001/api/v0" });
  }

  console.log("📦 IPFS client initialized");
  return client;
}

/**
 * upload JSON or Buffer. Returns ipfs path (CID)
 * @param {Buffer|string|object} data
 */
async function uploadJSON(data) {
  if (!client) init();
  const payload = typeof data === "string" || Buffer.isBuffer(data) ? data : JSON.stringify(data);
  const { path } = await client.add(payload);
  return path; // CID
}

module.exports = { init, uploadJSON };
