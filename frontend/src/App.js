// frontend/src/App.js
import React, { useState } from "react";
import "./App.css";
import WalletConnect from "./components/WalletConnect";
import PatientDashboard from "./components/PatientDashboard";
import DoctorDashboard from "./components/DoctorDashboard";
import EmergencyAccess from "./components/EmergencyAccess";

function App() {
  const [wallet, setWallet] = useState(null);
  const [activeTab, setActiveTab] = useState("patient");

  function handleWalletConnect(walletData) {
    setWallet(walletData);
  }

  function handleWalletDisconnect() {
    setWallet(null);
  }

  return (
    <div className="App">
      <header className="app-header">
        <div className="header-content">
          <h1>🏥 CareVault</h1>
          <p className="subtitle">Decentralized Health Records</p>
        </div>
        <WalletConnect
          onConnect={handleWalletConnect}
          onDisconnect={handleWalletDisconnect}
        />
      </header>

      <nav className="app-nav">
        <button
          className={activeTab === "patient" ? "nav-btn active" : "nav-btn"}
          onClick={() => setActiveTab("patient")}
        >
          Patient
        </button>
        <button
          className={activeTab === "doctor" ? "nav-btn active" : "nav-btn"}
          onClick={() => setActiveTab("doctor")}
        >
          Doctor
        </button>
        <button
          className={activeTab === "emergency" ? "nav-btn active" : "nav-btn"}
          onClick={() => setActiveTab("emergency")}
        >
          Emergency
        </button>
      </nav>

      <main className="app-main">
        {!wallet?.account && (
          <div className="connect-prompt">
            <h2>Connect Your Wallet</h2>
            <p>Please connect your MetaMask wallet to continue</p>
          </div>
        )}

        {wallet?.account && (
          <>
            {activeTab === "patient" && <PatientDashboard wallet={wallet} />}
            {activeTab === "doctor" && (
              <DoctorDashboard wallet={wallet} contract={wallet.contract} />
            )}
            {activeTab === "emergency" && (
              <EmergencyAccess wallet={wallet} contract={wallet.contract} />
            )}
          </>
        )}
      </main>

      <footer className="app-footer">
        <p>Powered by Blockchain • IPFS • AI</p>
      </footer>
    </div>
  );
}

export default App;
