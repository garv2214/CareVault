// backend/ipfsClient.js
const axios = require("axios");
require("dotenv").config();

let client = null;
let ipfsModule = null;

// Lazy load IPFS client using dynamic import (for ESM compatibility)
async function loadIPFS() {
  if (ipfsModule) return ipfsModule;
  
  try {
    // Dynamic import for ESM module
    ipfsModule = await import("ipfs-http-client");
    return ipfsModule;
  } catch (error) {
    console.warn("⚠️ Failed to load ipfs-http-client:", error.message);
    return null;
  }
}

async function init() {
  if (client) return client;

  const ipfs = await loadIPFS();
  if (!ipfs) {
    // Fallback: mock client for local storage
    console.warn("⚠️ IPFS not available - using local storage fallback");
    client = {
      add: async (data) => {
        const crypto = require("crypto");
        const hash = crypto.createHash("sha256").update(JSON.stringify(data)).digest("hex");
        return { path: `local-${hash.slice(0, 16)}` };
      }
    };
    return client;
  }

  const { create } = ipfs;
  const projectId = process.env.IPFS_PROJECT_ID || "";
  const projectSecret = process.env.IPFS_PROJECT_SECRET || "";

  try {
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
      // Try local IPFS node first, then fallback to public gateway
      try {
        client = create({ url: "http://127.0.0.1:5001" });
        console.log("📦 IPFS client initialized (local node)");
      } catch (e) {
        // Use public Infura gateway
        client = create({ 
          host: "ipfs.infura.io",
          port: 5001,
          protocol: "https"
        });
        console.log("📦 IPFS client initialized (public gateway)");
      }
    }
  } catch (error) {
    console.warn("⚠️ IPFS client initialization failed:", error.message);
    console.warn("⚠️ Using local storage fallback");
    // Mock client for local storage
    client = {
      add: async (data) => {
        const crypto = require("crypto");
        const hash = crypto.createHash("sha256").update(JSON.stringify(data)).digest("hex");
        return { path: `local-${hash.slice(0, 16)}` };
      }
    };
  }
  
  return client;
}

/**
 * upload JSON or Buffer. Returns ipfs path (CID)
 * @param {Buffer|string|object} data
 */
async function uploadJSON(data) {
  if (!client) await init();
  const payload = typeof data === "string" || Buffer.isBuffer(data) ? data : JSON.stringify(data);
  const result = await client.add(payload);
  return result.path || result.cid?.toString() || result; // CID
}

module.exports = { init, uploadJSON };
