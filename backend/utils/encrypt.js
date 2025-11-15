// backend/utils/encrypt.js
const crypto = require("crypto");
require("dotenv").config();

// AES-256-CBC encryption. AES_SECRET_KEY must be 32 bytes (characters)
const ALGORITHM = "aes-256-cbc";
const KEY = process.env.AES_SECRET_KEY || "01234567890123456789012345678901"; // fallback (32 chars) - replace!
if (KEY.length !== 32) {
  console.warn("⚠️ AES_SECRET_KEY should be 32 characters for AES-256. Current length:", KEY.length);
}

function encrypt(text) {
  // iv should be 16 bytes
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(KEY), iv);
  let encrypted = cipher.update(typeof text === "string" ? text : JSON.stringify(text), "utf8", "hex");
  encrypted += cipher.final("hex");
  // return iv + encrypted (hex encoded)
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
  } catch (e) {
    return dec;
  }
}

module.exports = { encrypt, decrypt };
