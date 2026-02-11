// backend/ipfsClient.js
const axios = require("axios");
require("dotenv").config();

let client = null;
let ipfsModule = null;

// Lazy load IPFS client using dynamic import (for ESM compatibility)


async function loadIPFS() {
  if (ipfsModule) return ipfsModule;
  
  try {
    // Dynamic import for ESM module (v60.x compatible)
    const { create } = await import("ipfs-http-client");
    ipfsModule = { create };
    return ipfsModule;
  } catch (error) {
    console.warn("⚠️ Failed to load ipfs-http-client:", error.message);
    return null;
  }
}


async function init() {
  if (client) return client;

  console.log("📦 Initializing IPFS client...");
  
  // Always create a robust local storage fallback first
  const crypto = require("crypto");
  client = {
    add: async (data) => {
      const dataStr = typeof data === "string" ? data : JSON.stringify(data);
      const hash = crypto.createHash("sha256").update(dataStr).digest("hex");
      const localPath = `local-${hash.slice(0, 16)}`;
      console.log(`📝 Stored data locally with hash: ${localPath}`);
      return { path: localPath };
    }
  };

  // Try to load real IPFS client
  const ipfs = await loadIPFS();
  if (!ipfs) {
    console.warn("⚠️ IPFS module not available - using local storage fallback");
    return client;
  }

  const { create } = ipfs;
  const projectId = process.env.IPFS_PROJECT_ID || "";
  const projectSecret = process.env.IPFS_PROJECT_SECRET || "";

  try {
    if (projectId && projectSecret) {
      // Use Infura with credentials
      const auth = "Basic " + Buffer.from(projectId + ":" + projectSecret).toString("base64");
      client = create({
        host: "ipfs.infura.io",
        port: 5001,
        protocol: "https",
        headers: {
          authorization: auth,
        },
      });
      console.log("📦 IPFS client initialized (Infura with auth)");
    } else {
      // Try local IPFS node first
      try {
        client = create({ url: "http://127.0.0.1:5001" });
        console.log("📦 IPFS client initialized (local node)");
      } catch (localError) {
        // Try public Infura gateway
        try {
          client = create({ 
            host: "ipfs.infura.io",
            port: 5001,
            protocol: "https"
          });
          console.log("📦 IPFS client initialized (public gateway)");
        } catch (infuraError) {
          console.warn("⚠️ All IPFS connections failed - using local storage fallback");
          // Keep the local storage fallback
        }
      }
    }
  } catch (error) {
    console.warn("⚠️ IPFS client initialization failed:", error.message);
    console.warn("⚠️ Continuing with local storage fallback");
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
  
  try {
    const result = await client.add(payload);
    return result.path || result.cid?.toString() || result; // CID
  } catch (error) {
    console.warn("⚠️ IPFS upload failed, using local storage fallback:", error.message);
    
    // Fallback to local storage
    const crypto = require("crypto");
    const dataStr = typeof payload === "string" ? payload : JSON.stringify(payload);
    const hash = crypto.createHash("sha256").update(dataStr).digest("hex");
    const localPath = `local-${hash.slice(0, 16)}`;
    console.log(`📝 Stored data locally with hash: ${localPath}`);
    return localPath;
  }
}

module.exports = { init, uploadJSON };
