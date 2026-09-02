const request = require("supertest");
const { app } = require("../../index");
const { resetDb, getDb } = require("../../db/database");
const { createToken } = require("../../middleware/auth");

describe("Integration: Appointment Booking & Slot Lifecycle", () => {
  let adminToken, patientToken;
  let doctorId, slotId;
  const patientId = "patient-appt-1";

  beforeEach(() => {
    resetDb();

    adminToken = createToken({ id: "admin-1", role: "admin" });
    patientToken = createToken({ id: "pat-user-1", role: "patient", patientId });
  });

  test("Complete Appointment Flow: Create Doctor -> Add Slot -> Book -> Prevent Double-Booking -> Cancel -> Verify Restored", async () => {
    // 1. Admin adds a doctor
    const docRes = await request(app)
      .post("/api/providers/doctors")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        name: "Dr. Gregory House",
        specialty: "general",
        city: "Princeton",
      });

    expect(docRes.status).toBe(201);
    doctorId = docRes.body.doctor.id;
    expect(doctorId).toBeDefined();

    // 2. Doctor / Admin adds a time slot
    const slotRes = await request(app)
      .post("/api/providers/slots")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        doctorId,
        date: "2026-09-10",
        times: ["10:30"],
      });

    expect(slotRes.status).toBe(200);
    expect(slotRes.body.created.length).toBe(1);
    slotId = slotRes.body.created[0].id;
    expect(slotId).toBeDefined();
    expect(slotRes.body.created[0].available).toBe(true);

    // 3. Patient books the appointment
    const bookRes = await request(app)
      .post("/api/appointments/book")
      .set("Authorization", `Bearer ${patientToken}`)
      .send({
        doctorId,
        slotId,
        patientId,
        notes: "Diagnostic consultation",
      });

    expect(bookRes.status).toBe(201);
    expect(bookRes.body.success).toBe(true);
    const appointmentId = bookRes.body.appointment.id;

    // Verify slot is now unavailable in DB
    const db = getDb();
    const updatedSlot = db.timeSlots.find((s) => s.id === slotId);
    expect(updatedSlot.available).toBe(false);

    // 4. Another patient tries to book the same slot -> 409 Conflict
    const rivalToken = createToken({ id: "pat-user-2", role: "patient", patientId: "patient-appt-2" });
    const conflictRes = await request(app)
      .post("/api/appointments/book")
      .set("Authorization", `Bearer ${rivalToken}`)
      .send({
        doctorId,
        slotId,
        patientId: "patient-appt-2",
      });

    expect(conflictRes.status).toBe(409);

    // 5. Patient views appointments
    const listRes = await request(app)
      .get(`/api/appointments?patientId=${patientId}`)
      .set("Authorization", `Bearer ${patientToken}`);

    expect(listRes.status).toBe(200);
    expect(listRes.body.data.some((a) => a.id === appointmentId)).toBe(true);

    // 6. Patient cancels appointment
    const cancelRes = await request(app)
      .delete(`/api/appointments/${appointmentId}`)
      .set("Authorization", `Bearer ${patientToken}`);

    expect(cancelRes.status).toBe(200);
    expect(cancelRes.body.appointment.status).toBe("cancelled");

    // 7. Verify slot is restored to available
    const reloadedDb = getDb();
    const restoredSlot = reloadedDb.timeSlots.find((s) => s.id === slotId);
    expect(restoredSlot.available).toBe(true);
  });
});
