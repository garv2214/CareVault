const { createToken, verifyToken, authMiddleware, optionalAuth, requireRole } = require("../middleware/auth");

describe("Auth Middleware & Token Utilities", () => {
  const originalEnv = process.env.NODE_ENV;

  afterAll(() => {
    process.env.NODE_ENV = originalEnv;
  });

  test("createToken generates a valid 3-part JWT token", () => {
    const payload = { id: "user-123", role: "patient", patientId: "pat-1" };
    const token = createToken(payload);
    expect(typeof token).toBe("string");
    const parts = token.split(".");
    expect(parts.length).toBe(3);
  });

  test("verifyToken correctly decodes and validates a valid token", () => {
    const payload = { id: "user-456", role: "doctor", patientId: "" };
    const token = createToken(payload);
    const decoded = verifyToken(token);
    expect(decoded).not.toBeNull();
    expect(decoded.id).toBe("user-456");
    expect(decoded.role).toBe("doctor");
    expect(decoded.exp).toBeGreaterThan(Math.floor(Date.now() / 1000));
  });

  test("verifyToken returns null for expired token", () => {
    const payload = { id: "user-expired", role: "patient" };
    // Expire 10 seconds ago
    const token = createToken(payload, -10);
    const decoded = verifyToken(token);
    expect(decoded).toBeNull();
  });

  test("verifyToken returns null for tampered token", () => {
    const token = createToken({ id: "user-1" });
    const parts = token.split(".");
    const tampered = `${parts[0]}.${parts[1]}tampered.${parts[2]}`;
    expect(verifyToken(tampered)).toBeNull();
  });

  test("verifyToken returns null for malformed strings", () => {
    expect(verifyToken("invalid.token")).toBeNull();
    expect(verifyToken("")).toBeNull();
    expect(verifyToken(null)).toBeNull();
  });

  test("authMiddleware rejects requests without authorization header", () => {
    const req = { headers: {} };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const next = jest.fn();

    authMiddleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  test("authMiddleware attaches payload to req.user for valid token", () => {
    const payload = { id: "user-789", role: "admin" };
    const token = createToken(payload);
    const req = { headers: { authorization: `Bearer ${token}` } };
    const res = {};
    const next = jest.fn();

    authMiddleware(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(req.user).toBeDefined();
    expect(req.user.id).toBe("user-789");
    expect(req.user.role).toBe("admin");
  });

  test("optionalAuth proceeds without user for missing header", () => {
    const req = { headers: {} };
    const res = {};
    const next = jest.fn();

    optionalAuth(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(req.user).toBeUndefined();
  });

  test("requireRole allows permitted role and rejects forbidden role", () => {
    const allowedReq = { user: { role: "admin" } };
    const forbiddenReq = { user: { role: "patient" } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const nextAllowed = jest.fn();
    const nextForbidden = jest.fn();

    const roleGuard = requireRole("admin", "doctor");
    roleGuard(allowedReq, res, nextAllowed);
    expect(nextAllowed).toHaveBeenCalled();

    roleGuard(forbiddenReq, res, nextForbidden);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(nextForbidden).not.toHaveBeenCalled();
  });
});
