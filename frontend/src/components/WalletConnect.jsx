// frontend/src/components/WalletConnect.jsx
import React, { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import HealthRecordABI from "../abi/HealthRecord.json";

const CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS || "";

export default function WalletConnect({ onConnect, onDisconnect }) {
  const [account, setAccount] = useState(null);

  const handleDisconnect = useCallback(() => {
    setAccount(null);
    if (onDisconnect) {
      onDisconnect();
    }
  }, [onDisconnect]);

  const connectWallet = useCallback(async () => {
    if (!window.ethereum) {
      alert("MetaMask not detected. Please install MetaMask.");
      return;
    }

    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      const acc = ethers.getAddress(accounts[0]);
      setAccount(acc);

      const ethProvider = new ethers.BrowserProvider(window.ethereum);
      const signerObj = await ethProvider.getSigner();

      let contractInstance = null;
      if (CONTRACT_ADDRESS) {
        contractInstance = new ethers.Contract(CONTRACT_ADDRESS, HealthRecordABI.abi, signerObj);
      }

      if (onConnect) {
        onConnect({ account: acc, signer: signerObj, contract: contractInstance, provider: ethProvider });
      }
    } catch (err) {
      console.error("Connect error:", err);
      alert("Failed to connect wallet: " + err.message);
    }
  }, [onConnect]);

  const checkConnection = useCallback(async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: "eth_accounts" });
        if (accounts.length > 0) {
          await connectWallet();
        }
      } catch (err) {
        console.error("Check connection error:", err);
      }
    }
  }, [connectWallet]);

  useEffect(() => {
    if (typeof window.ethereum !== "undefined") {
      window.ethereum.on("accountsChanged", (accounts) => {
        if (accounts.length > 0) {
          setAccount(ethers.getAddress(accounts[0]));
        } else {
          handleDisconnect();
        }
      });

      window.ethereum.on("chainChanged", () => {
        window.location.reload();
      });

      // Check if already connected
      checkConnection();
    }
  }, [checkConnection, handleDisconnect]);

  return (
    <div className="wallet-connect">
      {account ? (
        <div className="wallet-info">
          <span className="wallet-address">
            {account.slice(0, 6)}...{account.slice(-4)}
          </span>
          <button onClick={handleDisconnect} className="btn-disconnect">
            Disconnect
          </button>
        </div>
      ) : (
        <button onClick={connectWallet} className="btn-connect">
          Connect Wallet
        </button>
      )}
    </div>
  );
}
