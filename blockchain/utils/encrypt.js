const crypto = require("crypto");

const ALGORITHM = "aes-256-cbc";
const KEY = process.env.AES_SECRET_KEY || "01234567890123456789012345678901";

module.exports = {
  encrypt: (data) => {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(KEY), iv);
    const text = typeof data === "string" ? data : JSON.stringify(data);
    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");
    return iv.toString("hex") + ":" + encrypted;
  },
  contentHash: (data) => {
    return crypto.createHash("sha256").update(typeof data === "string" ? data : JSON.stringify(data)).digest("hex");
  },
};
