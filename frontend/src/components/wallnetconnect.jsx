import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import HealthRecordABI from "../abi/HealthRecord.json"; // or path to ABI json

const CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS || "0x...";

export default function WalletConnect() {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [account, setAccount] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [contract, setContract] = useState(null);

  useEffect(() => {
    if (typeof window.ethereum !== "undefined") {
      const ethProvider = new ethers.BrowserProvider(window.ethereum);
      setProvider(ethProvider);

      // listen for account / chain changes
      window.ethereum.on("accountsChanged", (accounts) => {
        setAccount(accounts.length ? ethers.getAddress(accounts[0]) : null);
      });
      window.ethereum.on("chainChanged", (chainHex) => {
        setChainId(parseInt(chainHex, 16));
      });
    }
    return () => {
      if (window.ethereum?.removeListener) {
        window.ethereum.removeListener("accountsChanged", () => {});
        window.ethereum.removeListener("chainChanged", () => {});
      }
    };
  }, []);

  async function connectWallet() {
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
      setSigner(signerObj);

      const network = await ethProvider.getNetwork();
      setChainId(network.chainId);

      // create contract instance (connected with signer)
      const c = new ethers.Contract(CONTRACT_ADDRESS, HealthRecordABI.abi || HealthRecordABI, signerObj);
      setContract(c);
    } catch (err) {
      console.error("connect error:", err);
    }
  }

  async function disconnect() {
    setAccount(null);
    setSigner(null);
    setContract(null);
  }

  // Example: call grantAccess(patientId, granteeAddress)
  async function grantAccess(patientId, granteeAddress) {
    if (!contract) return alert("Connect first");
    try {
      const tx = await contract.grantAccess(patientId, granteeAddress);
      console.log("tx sent:", tx);
      await tx.wait();
      console.log("Access granted on-chain");
    } catch (err) {
      console.error("grantAccess failed:", err);
    }
  }

  return (
    <div>
      <h3>CareVault — MetaMask</h3>
      {account ? (
        <div>
          <p>Connected: {account}</p>
          <p>Chain ID: {chainId}</p>
          <button onClick={() => disconnect()}>Disconnect</button>
          <hr />
          {/* Example usage UI - replace patientId / address with real values */}
          <button onClick={() => grantAccess("patient-123", "0xabc...")}>Grant Access (example)</button>
        </div>
      ) : (
        <button onClick={() => connectWallet()}>Connect MetaMask</button>
      )}
    </div>
  );
}
