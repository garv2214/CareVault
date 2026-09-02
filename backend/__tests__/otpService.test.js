const { sendOTP, verifyOTP } = require("../services/otpService");
const { getDb, resetDb } = require("../db/database");

describe("OTP Service", () => {
  beforeEach(() => {
    resetDb();
  });

  test("sendOTP generates a 6-digit OTP and stores it", () => {
    const phone = "9876543210";
    const res = sendOTP(phone);
    expect(res.success).toBe(true);
    expect(res.message).toBeDefined();

    const db = getDb();
    expect(db.otpStore[phone]).toBeDefined();
    expect(db.otpStore[phone].otp).toMatch(/^\d{6}$/);
    expect(db.otpStore[phone].expiresAt).toBeGreaterThan(Date.now());
  });

  test("verifyOTP returns valid: true for correct OTP and cleans up", () => {
    const phone = "9876543211";
    sendOTP(phone);
    const db = getDb();
    const storedOtp = db.otpStore[phone].otp;

    const verification = verifyOTP(phone, storedOtp);
    expect(verification.valid).toBe(true);

    // Should delete OTP from store after successful verification
    expect(db.otpStore[phone]).toBeUndefined();
  });

  test("verifyOTP rejects wrong OTP code", () => {
    const phone = "9876543212";
    sendOTP(phone);

    const verification = verifyOTP(phone, "000000");
    expect(verification.valid).toBe(false);
    expect(verification.message).toBe("Invalid OTP");
  });

  test("verifyOTP rejects when no OTP was requested", () => {
    const verification = verifyOTP("0000000000", "123456");
    expect(verification.valid).toBe(false);
    expect(verification.message).toBe("No OTP requested for this number");
  });

  test("verifyOTP rejects expired OTP", () => {
    const phone = "9876543213";
    sendOTP(phone);
    const db = getDb();
    // Force expire
    db.otpStore[phone].expiresAt = Date.now() - 1000;

    const verification = verifyOTP(phone, db.otpStore[phone].otp);
    expect(verification.valid).toBe(false);
    expect(verification.message).toBe("OTP expired");
    expect(db.otpStore[phone]).toBeUndefined();
  });
});
