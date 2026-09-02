const request = require("supertest");
const { app } = require("../../index");
const { resetDb, getDb } = require("../../db/database");
const { createToken } = require("../../middleware/auth");

describe("Integration: Emergency Protocol Flow", () => {
  let patientToken, responderToken;
  const patientId = "patient-emergency-999";
  const userId = "usr-emergency-patient";

  beforeEach(() => {
    resetDb();
    const db = getDb();

    db.users.push({
      id: userId,
      phone: "9112233440",
      name: "Emergency Patient",
      role: "patient",
      patientId,
      walletAddress: "0x4444444444444444444444444444444444444444",
      city: "New York",
    });

    patientToken = createToken({
      id: userId,
      role: "patient",
      patientId,
      name: "Emergency Patient",
    });

    responderToken = createToken({
      id: "usr-responder-99",
      role: "responder",
      name: "Emergency Medic",
    });
  });

  test("Complete Emergency Lifecycle: Add Contacts -> Trigger SOS -> Dispatch Alerts -> Fetch Emergency Summary", async () => {
    // 1. Add Emergency Contacts
    const contactRes1 = await request(app)
      .post("/api/health/emergency-contacts")
      .set("Authorization", `Bearer ${patientToken}`)
      .send({
        patientId,
        name: "Doctor Contact",
        phone: "9112233445",
        relationship: "Physician",
      });
    expect(contactRes1.status).toBe(201);

    const contactRes2 = await request(app)
      .post("/api/health/emergency-contacts")
      .set("Authorization", `Bearer ${patientToken}`)
      .send({
        patientId,
        name: "Family Contact",
        phone: "9112233446",
        relationship: "Sibling",
      });
    expect(contactRes2.status).toBe(201);

    // 2. Trigger SOS / Emergency
    const triggerRes = await request(app)
      .post("/api/health/emergency/trigger")
      .set("Authorization", `Bearer ${patientToken}`)
      .send({
        patientId,
        reason: "Severe Anaphylaxis / Difficulty Breathing",
        location: "Central Park West, Apt 4B",
      });

    expect(triggerRes.status).toBe(200);
    expect(triggerRes.body.success).toBe(true);
    expect(triggerRes.body.alertsSent).toBeGreaterThanOrEqual(2);

    // 3. Verify notifications generated in DB
    const db = getDb();
    const patientNotifications = db.notifications.filter((n) => n.userId === userId);
    expect(patientNotifications.length).toBeGreaterThan(0);

    // 4. Add a dummy health record so emergency summary can populate
    const addRecRes = await request(app)
      .post("/api/health")
      .set("Authorization", `Bearer ${patientToken}`)
      .send({
        patientId,
        recordData: { heart_rate: 110, blood_pressure: "140/95" },
      });
    expect(addRecRes.status).toBe(201);

    // 5. Verify emergency responder can access summary
    const summaryRes = await request(app)
      .get(`/api/health/emergency/${patientId}`)
      .set("Authorization", `Bearer ${responderToken}`);

    expect(summaryRes.status).toBe(200);
    expect(summaryRes.body.summary.emergencyContacts.length).toBe(2);
  });
});
