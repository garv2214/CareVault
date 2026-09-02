const crypto = require("crypto");
require("dotenv").config();

const ALGORITHM = "aes-256-cbc";
const KEY_RAW = process.env.AES_SECRET_KEY || "01234567890123456789012345678901";
if (!process.env.AES_SECRET_KEY && process.env.NODE_ENV === "production") {
  throw new Error("CRITICAL: AES_SECRET_KEY environment variable is required in production!");
}
// Normalize key to 32 bytes using sha256 if needed
const KEY = crypto.createHash("sha256").update(KEY_RAW).digest();

function encrypt(text) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(KEY), iv);
  let encrypted = cipher.update(typeof text === "string" ? text : JSON.stringify(text), "utf8", "hex");
  encrypted += cipher.final("hex");
  return iv.toString("hex") + ":" + encrypted;
}

function decrypt(payload) {
  const [ivHex, encrypted] = payload.split(":");
  const iv = Buffer.from(ivHex, "hex");
  const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(KEY), iv);
  let dec = decipher.update(encrypted, "hex", "utf8");
  dec += decipher.final("utf8");
  try {
    return JSON.parse(dec);
  } catch {
    return dec;
  }
}

function contentHash(data) {
  return crypto.createHash("sha256").update(typeof data === "string" ? data : JSON.stringify(data)).digest("hex");
}

function hashEmergencyToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

module.exports = { encrypt, decrypt, contentHash, hashEmergencyToken };
