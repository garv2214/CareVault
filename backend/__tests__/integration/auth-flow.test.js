const request = require("supertest");
const { app } = require("../../index");
const { resetDb, getDb } = require("../../db/database");
const { sendOTP } = require("../../services/otpService");

describe("Integration: Auth Flow", () => {
  beforeEach(() => {
    resetDb();
  });

  test("Complete Auth Lifecycle: Send OTP -> Verify -> Register -> Get Profile -> Update Profile", async () => {
    const phone = "9123456780";

    // 1. Send OTP
    const sendRes = await request(app)
      .post("/api/auth/send-otp")
      .send({ phone });
    expect(sendRes.status).toBe(200);
    expect(sendRes.body.success).toBe(true);

    // 2. Fetch OTP from DB store to simulate SMS retrieval
    const db = getDb();
    const storedOtp = db.otpStore[phone]?.otp;
    expect(storedOtp).toBeDefined();
    expect(storedOtp).toHaveLength(6);

    // 3. Verify OTP (New User)
    const verifyRes = await request(app)
      .post("/api/auth/verify-otp")
      .send({ phone, otp: storedOtp });
    expect(verifyRes.status).toBe(200);
    expect(verifyRes.body.success).toBe(true);
    expect(verifyRes.body.isNewUser).toBe(true);

    // 4. Register new user
    const registerRes = await request(app)
      .post("/api/auth/register")
      .send({
        phone,
        name: "Alice Wonderland",
        role: "patient",
        city: "Bangalore",
      });
    expect(registerRes.status).toBe(201);
    expect(registerRes.body.success).toBe(true);
    expect(registerRes.body.token).toBeDefined();

    const authToken = registerRes.body.token;

    // 5. Get Profile using Auth Token
    const profileRes = await request(app)
      .get("/api/auth/profile")
      .set("Authorization", `Bearer ${authToken}`);
    expect(profileRes.status).toBe(200);
    expect(profileRes.body.user.name).toBe("Alice Wonderland");
    expect(profileRes.body.user.role).toBe("patient");
    expect(profileRes.body.user.patientId).toBeDefined();

    // 6. Update Profile
    const updateRes = await request(app)
      .put("/api/auth/profile")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        name: "Alice W. Smith",
        city: "New Delhi",
      });
    expect(updateRes.status).toBe(200);
    expect(updateRes.body.user.name).toBe("Alice W. Smith");
    expect(updateRes.body.user.city).toBe("New Delhi");

    // 7. Verify login again for existing user
    sendOTP(phone);
    const newOtp = getDb().otpStore[phone].otp;
    const loginRes = await request(app)
      .post("/api/auth/verify-otp")
      .send({ phone, otp: newOtp });
    expect(loginRes.status).toBe(200);
    expect(loginRes.body.isNewUser).toBe(false);
    expect(loginRes.body.user.name).toBe("Alice W. Smith");
  });
});
