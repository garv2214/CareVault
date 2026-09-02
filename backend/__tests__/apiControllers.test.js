const request = require("supertest");
const { app } = require("../index");
const { resetDb, getDb } = require("../db/database");
const { createToken } = require("../middleware/auth");
const { sendOTP } = require("../services/otpService");

describe("API Controllers & Route Tests", () => {
  let patientToken, doctorToken, adminToken;
  let patientUser, doctorUser, adminUser;

  beforeEach(() => {
    resetDb();
    const db = getDb();

    patientUser = {
      id: "user-patient-1",
      phone: "9876543210",
      name: "John Patient",
      role: "patient",
      patientId: "patient-101",
      walletAddress: "0x1111111111111111111111111111111111111111",
      city: "Mumbai",
    };
    doctorUser = {
      id: "user-doctor-1",
      phone: "9876543211",
      name: "Dr. Smith",
      role: "doctor",
      doctorId: db.doctors[0]?.id || "doc-001",
      walletAddress: "0x2222222222222222222222222222222222222222",
      city: "Mumbai",
    };
    adminUser = {
      id: "user-admin-1",
      phone: "9876543212",
      name: "Admin Super",
      role: "admin",
      walletAddress: "0x3333333333333333333333333333333333333333",
      city: "Mumbai",
    };

    db.users.push(patientUser, doctorUser, adminUser);

    patientToken = createToken({ id: patientUser.id, role: patientUser.role, patientId: patientUser.patientId });
    doctorToken = createToken({ id: doctorUser.id, role: doctorUser.role, doctorId: doctorUser.doctorId });
    adminToken = createToken({ id: adminUser.id, role: adminUser.role });
  });

  describe("Auth Routes", () => {
    test("POST /api/auth/send-otp sends OTP", async () => {
      const res = await request(app)
        .post("/api/auth/send-otp")
        .send({ phone: "9876543299" });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    test("POST /api/auth/verify-otp succeeds for correct OTP", async () => {
      sendOTP("9876543210");
      const db = getDb();
      const otp = db.otpStore["9876543210"].otp;

      const res = await request(app)
        .post("/api/auth/verify-otp")
        .send({ phone: "9876543210", otp });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
      expect(res.body.isNewUser).toBe(false);
    });

    test("POST /api/auth/register registers new user and issues token", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({
          phone: "9876543999",
          name: "Newbie",
          role: "patient",
          city: "Delhi",
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.user.phone).toBe("9876543999");
      expect(res.body.token).toBeDefined();
    });

    test("GET /api/auth/profile returns authenticated user profile", async () => {
      const res = await request(app)
        .get("/api/auth/profile")
        .set("Authorization", `Bearer ${patientToken}`);

      expect(res.status).toBe(200);
      expect(res.body.user.name).toBe("John Patient");
    });
  });

  describe("Provider Routes", () => {
    test("GET /api/providers/doctors returns list of doctors", async () => {
      const res = await request(app).get("/api/providers/doctors");
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    test("GET /api/providers/specialties returns specialties", async () => {
      const res = await request(app).get("/api/providers/specialties");
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    test("POST /api/providers/doctors requires admin role", async () => {
      const newDoc = { name: "Dr. House", specialty: "general", city: "Mumbai" };
      const deniedRes = await request(app)
        .post("/api/providers/doctors")
        .set("Authorization", `Bearer ${patientToken}`)
        .send(newDoc);
      expect(deniedRes.status).toBe(403);

      const allowedRes = await request(app)
        .post("/api/providers/doctors")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(newDoc);
      expect(allowedRes.status).toBe(201);
      expect(allowedRes.body.doctor.name).toBe("Dr. House");
    });
  });

  describe("Appointments Routes", () => {
    test("Book appointment locks slot and prevents double booking", async () => {
      const db = getDb();
      const slot = db.timeSlots[0];

      // Book slot
      const bookRes = await request(app)
        .post("/api/appointments/book")
        .set("Authorization", `Bearer ${patientToken}`)
        .send({
          doctorId: slot.doctorId,
          slotId: slot.id,
          patientId: patientUser.patientId,
          notes: "Routine checkup",
        });

      expect(bookRes.status).toBe(201);
      expect(bookRes.body.appointment.slotId).toBe(slot.id);

      // Attempt double booking
      const doubleBookRes = await request(app)
        .post("/api/appointments/book")
        .set("Authorization", `Bearer ${patientToken}`)
        .send({
          doctorId: slot.doctorId,
          slotId: slot.id,
          patientId: "patient-999",
        });

      expect(doubleBookRes.status).toBe(409);
      expect(doubleBookRes.body.message).toContain("double-booking");

      // Cancel appointment frees the slot
      const apptId = bookRes.body.appointment.id;
      const cancelRes = await request(app)
        .delete(`/api/appointments/${apptId}`)
        .set("Authorization", `Bearer ${patientToken}`);

      expect(cancelRes.status).toBe(200);
      expect(cancelRes.body.appointment.status).toBe("cancelled");

      const reloadedSlot = db.timeSlots.find((s) => s.id === slot.id);
      expect(reloadedSlot.available).toBe(true);
    });
  });

  describe("Health & Emergency Routes", () => {
    test("Add and retrieve health records", async () => {
      const addRes = await request(app)
        .post("/api/health")
        .set("Authorization", `Bearer ${patientToken}`)
        .send({
          patientId: patientUser.patientId,
          recordData: { heart_rate: 75, blood_pressure: "120/80" },
        });

      expect(addRes.status).toBe(201);
      expect(addRes.body.ipfsHash).toBeDefined();

      const getRes = await request(app)
        .get(`/api/health?patientId=${patientUser.patientId}`)
        .set("Authorization", `Bearer ${patientToken}`);

      expect(getRes.status).toBe(200);
      expect(getRes.body.data.length).toBeGreaterThan(0);
    });

    test("Emergency contacts management and emergency trigger", async () => {
      const contactRes = await request(app)
        .post("/api/health/emergency-contacts")
        .set("Authorization", `Bearer ${patientToken}`)
        .send({
          patientId: patientUser.patientId,
          name: "Jane Doe",
          phone: "9998887776",
          relationship: "Spouse",
        });

      expect(contactRes.status).toBe(201);
      expect(contactRes.body.contact.name).toBe("Jane Doe");

      const triggerRes = await request(app)
        .post("/api/health/emergency/trigger")
        .set("Authorization", `Bearer ${patientToken}`)
        .send({
          patientId: patientUser.patientId,
          reason: "Sudden chest pain",
          location: "Home",
        });

      expect(triggerRes.status).toBe(200);
      expect(triggerRes.body.alertsSent).toBeGreaterThanOrEqual(1);
    });
  });

  describe("Content Routes", () => {
    test("Medications CRUD", async () => {
      const createRes = await request(app)
        .post("/api/content/medications")
        .set("Authorization", `Bearer ${patientToken}`)
        .send({
          patientId: patientUser.patientId,
          name: "Amoxicillin",
          dosage: "500mg",
          frequency: "twice daily",
        });

      expect(createRes.status).toBe(201);
      const medId = createRes.body.medication.id;

      const getRes = await request(app)
        .get(`/api/content/medications?patientId=${patientUser.patientId}`)
        .set("Authorization", `Bearer ${patientToken}`);

      expect(getRes.status).toBe(200);
      expect(getRes.body.data.some((m) => m.id === medId)).toBe(true);

      const delRes = await request(app)
        .delete(`/api/content/medications/${medId}`)
        .set("Authorization", `Bearer ${patientToken}`);

      expect(delRes.status).toBe(200);
    });
  });

  describe("AI Routes", () => {
    test("POST /api/ai/predict returns valid prediction", async () => {
      const res = await request(app)
        .post("/api/ai/predict")
        .set("Authorization", `Bearer ${patientToken}`)
        .send({
          heart_rate: 80,
          systolic_bp: 120,
          oxygen_saturation: 98,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.prediction).toBeDefined();
      expect(res.body.prediction.prediction).toBe("STABLE");
    });
  });
});
