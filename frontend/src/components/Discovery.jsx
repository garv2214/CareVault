import React, { useState, useEffect } from "react";
import { api } from "../services/api";

export default function Discovery() {
  const [doctors, setDoctors] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [articles, setArticles] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [filters, setFilters] = useState({ search: "", specialty: "", city: "" });
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [slots, setSlots] = useState([]);
  const [tab, setTab] = useState("doctors");

  useEffect(() => {
    async function loadData() {
      try {
        const [docRes, hospRes, artRes, specRes] = await Promise.all([
          api.getDoctors(filters),
          api.getHospitals(filters.city),
          api.getArticles(),
          api.getSpecialties(),
        ]);
        setDoctors(docRes.data || []);
        setHospitals(hospRes.data || []);
        setArticles(artRes.data || []);
        setSpecialties(specRes.data || []);
      } catch (err) {
        console.error("Discovery load error:", err);
      }
    }
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function search() {
    try {
      const res = await api.getDoctors(filters);
      setDoctors(res.data || []);
    } catch (err) {
      console.error(err);
    }
  }

  async function viewDoctor(doctor) {
    setSelectedDoctor(doctor);
    try {
      await api.getDoctor(doctor.id);
      const slotRes = await api.getSlots({ doctorId: doctor.id });
      setSlots(slotRes.data || []);
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Discover Healthcare</h2>
      </div>

      <div className="discovery-tabs">
        {["doctors", "hospitals", "articles"].map((t) => (
          <button key={t} className={`tab-btn ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {tab === "doctors" && (
        <>
          <div className="search-bar">
            <input placeholder="Search doctors..." value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} />
            <select value={filters.specialty} onChange={(e) => setFilters({ ...filters, specialty: e.target.value })}>
              <option value="">All Specialties</option>
              {specialties.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <input placeholder="City" value={filters.city} onChange={(e) => setFilters({ ...filters, city: e.target.value })} />
            <button className="btn-primary" onClick={search}>Search</button>
          </div>
          <div className="records-grid">
            {doctors.map((d) => (
              <div key={d.id} className="record-card clickable" onClick={() => viewDoctor(d)}>
                <h4>{d.name}</h4>
                <p>{d.specialtyName} · {d.city}</p>
                <p>⭐ {d.rating} · {d.experience} yrs exp</p>
              </div>
            ))}
          </div>
          {selectedDoctor && (
            <div className="doctor-detail">
              <h3>{selectedDoctor.name}</h3>
              <p>{selectedDoctor.bio}</p>
              <h4>Available Slots ({slots.length})</h4>
              <div className="slot-grid">
                {slots.slice(0, 12).map((s) => (
                  <span key={s.id} className="slot-chip">{s.date} {s.time}</span>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {tab === "hospitals" && (
        <div className="records-grid">
          {hospitals.map((h) => (
            <div key={h.id} className="record-card">
              <h4>{h.name}</h4>
              <p>{h.city}</p>
              <p className="text-muted">{h.address}</p>
            </div>
          ))}
        </div>
      )}

      {tab === "articles" && (
        <div className="records-grid">
          {articles.map((a) => (
            <div key={a.id} className="record-card">
              <span className="badge">{a.category}</span>
              <h4>{a.title}</h4>
              <p>{a.summary}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
