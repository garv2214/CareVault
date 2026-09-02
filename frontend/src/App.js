import React, { useState, useEffect } from "react";
import "./App.css";
import { api } from "./services/api";
import WalletConnect from "./components/WalletConnect";
import Login from "./components/Login";
import OTPVerify from "./components/OTPVerify";
import ProfileSetup from "./components/ProfileSetup";
import PatientDashboard from "./components/PatientDashboard";
import DoctorDashboard from "./components/DoctorDashboard";
import EmergencyAccess from "./components/EmergencyAccess";
import Discovery from "./components/Discovery";
import Appointments from "./components/Appointments";
import MedicationReminders from "./components/MedicationReminders";
import AdminDashboard from "./components/AdminDashboard";
import EmergencyButton from "./components/EmergencyButton";

function App() {
  const [authStep, setAuthStep] = useState("login");
  const [phone, setPhone] = useState("");
  const [user, setUser] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [activeTab, setActiveTab] = useState("home");
  const [emergencyModal, setEmergencyModal] = useState(false);

  useEffect(() => {
    const saved = api.getUser();
    const token = api.getToken();
    if (saved && token) {
      setUser(saved);
      setAuthStep("done");
      setActiveTab(saved.role === "admin" ? "admin" : saved.role === "doctor" ? "doctor" : "home");
    }
  }, []);

  function handleLogout() {
    api.setToken(null);
    api.setUser(null);
    setUser(null);
    setWallet(null);
    setAuthStep("login");
    setActiveTab("home");
  }

  async function handleEmergencyTrigger() {
    setEmergencyModal(true);
    setActiveTab("emergency");
    if (user?.patientId) {
      try {
        await api.triggerEmergency({
          patientId: user.patientId,
          reason: "SOS button activated by patient",
          location: "Current location (GPS pending)",
        });
      } catch (err) {
        console.error("Emergency trigger error:", err);
      }
    }
  }

  const patientTabs = [
    { id: "home", label: "Records" },
    { id: "discover", label: "Discover" },
    { id: "appointments", label: "Appointments" },
    { id: "medications", label: "Medications" },
    { id: "emergency", label: "Emergency" },
  ];
  const doctorTabs = [
    { id: "doctor", label: "Patients" },
    { id: "appointments", label: "Schedule" },
    { id: "discover", label: "Directory" },
  ];
  const adminTabs = [
    { id: "admin", label: "Admin" },
    { id: "discover", label: "Directory" },
    { id: "appointments", label: "Appointments" },
  ];

  const tabs = user?.role === "admin" ? adminTabs : user?.role === "doctor" ? doctorTabs : patientTabs;

  if (authStep !== "done") {
    return (
      <div className="App auth-screen">
        <div className="auth-header">
          <h1>🏥 CareVault</h1>
          <p>Decentralized Health Records & Emergency Access</p>
        </div>
        {authStep === "login" && <Login onOtpSent={(p) => { setPhone(p); setAuthStep("otp"); }} />}
        {authStep === "otp" && (
          <OTPVerify
            phone={phone}
            onBack={() => setAuthStep("login")}
            onVerified={(data) => {
              if (data.isNewUser) setAuthStep("profile");
              else { setUser(data.user); setAuthStep("done"); }
            }}
          />
        )}
        {authStep === "profile" && (
          <ProfileSetup phone={phone} onComplete={(u) => { setUser(u); setAuthStep("done"); }} />
        )}
      </div>
    );
  }

  return (
    <div className="App">
      <header className="app-header">
        <div className="header-content">
          <h1>🏥 CareVault</h1>
          <p className="subtitle">Welcome, {user.name} ({user.role})</p>
        </div>
        <div className="header-actions">
          <WalletConnect onConnect={setWallet} onDisconnect={() => setWallet(null)} />
          <button className="btn-disconnect" onClick={handleLogout}>Logout</button>
        </div>
      </header>

      <nav className="app-nav">
        {tabs.map((t) => (
          <button key={t.id} className={activeTab === t.id ? "nav-btn active" : "nav-btn"} onClick={() => setActiveTab(t.id)}>
            {t.label}
          </button>
        ))}
      </nav>

      <main className="app-main">
        {activeTab === "home" && <PatientDashboard user={user} wallet={wallet} />}
        {activeTab === "doctor" && <DoctorDashboard user={user} wallet={wallet} />}
        {activeTab === "discover" && <Discovery />}
        {activeTab === "appointments" && <Appointments user={user} />}
        {activeTab === "medications" && <MedicationReminders user={user} />}
        {activeTab === "emergency" && <EmergencyAccess user={user} wallet={wallet} emergencyTriggered={emergencyModal} />}
        {activeTab === "admin" && <AdminDashboard />}
      </main>

      <EmergencyButton user={user} onEmergency={handleEmergencyTrigger} />

      <footer className="app-footer">
        <p>Powered by Blockchain · IPFS · AI · Secure Health Platform</p>
      </footer>
    </div>
  );
}

export default App;
