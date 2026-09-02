const crypto = require("crypto");

module.exports = {
  uploadToIPFS: async (data) => {
    const hash = crypto.createHash("sha256").update(JSON.stringify(data)).digest("hex");
    return `Qm${hash.slice(0, 44)}`;
  },
  contentHash: (data) => {
    return crypto.createHash("sha256").update(typeof data === "string" ? data : JSON.stringify(data)).digest("hex");
  },
};
