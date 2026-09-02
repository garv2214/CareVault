const crypto = require("crypto");

const JWT_SECRET = process.env.JWT_SECRET || (process.env.NODE_ENV === "production" ? null : "carevault-dev-secret-change-in-production");
if (!JWT_SECRET && process.env.NODE_ENV === "production") {
  throw new Error("CRITICAL: JWT_SECRET environment variable must be set in production!");
}

const DEFAULT_EXPIRY_SECONDS = 24 * 60 * 60; // 24 hours

function createToken(payload, expiresInSeconds = DEFAULT_EXPIRY_SECONDS) {
  const secret = JWT_SECRET || "carevault-dev-secret-change-in-production";
  const now = Math.floor(Date.now() / 1000);
  const exp = now + expiresInSeconds;
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const body = Buffer.from(JSON.stringify({ ...payload, iat: now, exp })).toString("base64url");
  const sig = crypto.createHmac("sha256", secret).update(`${header}.${body}`).digest("base64url");
  return `${header}.${body}.${sig}`;
}

function verifyToken(token) {
  try {
    if (!token || typeof token !== "string") return null;
    const secret = JWT_SECRET || "carevault-dev-secret-change-in-production";
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const [header, body, sig] = parts;
    const expected = crypto.createHmac("sha256", secret).update(`${header}.${body}`).digest("base64url");
    if (sig !== expected) return null;
    const parsed = JSON.parse(Buffer.from(body, "base64url").toString());
    const now = Math.floor(Date.now() / 1000);
    if (parsed.exp && parsed.exp < now) {
      return null; // Expired
    }
    return parsed;
  } catch {
    return null;
  }
}

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "Authentication required" });
  }
  const payload = verifyToken(authHeader.slice(7));
  if (!payload) {
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
  req.user = payload;
  next();
}

function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const payload = verifyToken(authHeader.slice(7));
    if (payload) req.user = payload;
  }
  next();
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: "Insufficient permissions" });
    }
    next();
  };
}

module.exports = { createToken, verifyToken, authMiddleware, optionalAuth, requireRole };
