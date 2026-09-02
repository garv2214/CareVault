import React, { useState, useEffect } from "react";
import { api } from "../services/api";

export default function Appointments({ user }) {
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [slots, setSlots] = useState([]);
  const [booking, setBooking] = useState({ doctorId: "", slotId: "", notes: "" });
  const [loading, setLoading] = useState(false);
  const [showBook, setShowBook] = useState(false);

  useEffect(() => {
    async function fetchAppointments() {
      try {
        const params = user?.role === "doctor"
          ? { doctorId: user.doctorId }
          : { patientId: user.patientId };
        const res = await api.getAppointments(params);
        setAppointments(res.data || []);
      } catch (err) {
        console.error(err);
      }
    }
    fetchAppointments();
    api.getDoctors().then((r) => setDoctors(r.data || [])).catch(console.error);
  }, [user]);

  async function loadAppointments() {
    try {
      const params = user?.role === "doctor"
        ? { doctorId: user.doctorId }
        : { patientId: user.patientId };
      const res = await api.getAppointments(params);
      setAppointments(res.data || []);
    } catch (err) {
      console.error(err);
    }
  }

  async function loadSlots(doctorId) {
    const res = await api.getSlots({ doctorId });
    setSlots(res.data || []);
  }

  async function handleBook(e) {
    e.preventDefault();
    if (!booking.doctorId || !booking.slotId) return alert("Select doctor and slot");
    setLoading(true);
    try {
      await api.bookAppointment({
        doctorId: booking.doctorId,
        slotId: booking.slotId,
        patientId: user.patientId,
        notes: booking.notes,
      });
      alert("Appointment booked successfully!");
      setShowBook(false);
      setBooking({ doctorId: "", slotId: "", notes: "" });
      loadAppointments();
    } catch (err) {
      alert("Booking failed: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCancel(id) {
    if (!window.confirm("Cancel this appointment?")) return;
    try {
      await api.cancelAppointment(id);
      loadAppointments();
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Appointments</h2>
        {user.role === "patient" && (
          <button className="btn-primary" onClick={() => setShowBook(!showBook)}>
            {showBook ? "Cancel" : "Book Appointment"}
          </button>
        )}
      </div>

      {showBook && user.role === "patient" && (
        <form onSubmit={handleBook} className="record-form">
          <div className="form-group">
            <label>Doctor</label>
            <select value={booking.doctorId} onChange={(e) => { setBooking({ ...booking, doctorId: e.target.value, slotId: "" }); loadSlots(e.target.value); }} required>
              <option value="">Select doctor</option>
              {doctors.map((d) => <option key={d.id} value={d.id}>{d.name} — {d.specialtyName}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Time Slot</label>
            <select value={booking.slotId} onChange={(e) => setBooking({ ...booking, slotId: e.target.value })} required>
              <option value="">Select slot</option>
              {slots.map((s) => <option key={s.id} value={s.id}>{s.date} at {s.time}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Notes</label>
            <textarea value={booking.notes} onChange={(e) => setBooking({ ...booking, notes: e.target.value })} rows="2" />
          </div>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Booking..." : "Confirm Booking"}
          </button>
        </form>
      )}

      <div className="records-list">
        <h3>{user.role === "doctor" ? "Your Schedule" : "My Appointments"}</h3>
        {appointments.length === 0 ? (
          <p className="empty-state">No appointments yet.</p>
        ) : (
          appointments.map((a) => (
            <div key={a.id} className="record-card appt-card">
              <div className="record-header">
                <span>{a.doctorName || a.doctorId}</span>
                <span className={`status-badge status-${a.status}`}>{a.status}</span>
              </div>
              <p>📅 {a.date} at {a.time}</p>
              {a.notes && <p className="text-muted">{a.notes}</p>}
              {a.status === "confirmed" && user.role === "patient" && (
                <button className="btn-secondary btn-sm" onClick={() => handleCancel(a.id)}>Cancel</button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
