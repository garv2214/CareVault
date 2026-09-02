const { ethers } = require("ethers");
require("dotenv").config();

const RPC_URL = process.env.ETH_RPC_URL || "http://127.0.0.1:8545";
const PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY || "";
const CONTRACT_ADDRESS = process.env.HEALTH_CONTRACT_ADDRESS || "";

const CONTRACT_ABI = [
  "function registerPatient(string _patientId) external",
  "function addRecord(string _patientId, string _ipfsHash, string _contentHash) external",
  "function grantAccess(string _patientId, address _grantee, uint256 _expiresAt) external",
  "function revokeAccess(string _patientId, address _grantee) external",
  "function authorizeEmergency(string _patientId, address _responder) external",
  "function emergencyAccess(string _patientId, string _reason) external",
  "function breakGlassAccess(string _patientId, string _hashedToken, string _reason) external",
  "function setEmergencyToken(string _patientId, string _hashedToken) external",
  "function hasAccess(string _patientId, address _addr) external view returns (bool)",
  "function isEmergencyAuthorized(string _patientId, address _addr) external view returns (bool)",
  "function getRecordCount() external view returns (uint256)",
  "function getRecordById(uint256) external view returns (uint256, string, string, string, uint256, address)",
  "function getRecordIdsForPatient(string) external view returns (uint256[])",
  "function getAuditLogCount() external view returns (uint256)",
  "function getAuditEntry(uint256) external view returns (uint256, string, address, string, string, uint256)",
  "function getPatientOwner(string) external view returns (address)",
  "function patientOwners(string) external view returns (address)",
  "event RecordAdded(uint256 indexed id, string patientId, string ipfsHash, string contentHash, address indexed uploader)",
  "event AccessGranted(string indexed patientId, address indexed grantee, uint256 expiresAt)",
  "event EmergencyAccessed(string indexed patientId, address indexed accessor, string reason, uint256 timestamp)",
  "event BreakGlassAccess(string indexed patientId, address indexed accessor, string reason, uint256 timestamp)",
];

let provider, signer, contract;

async function init() {
  provider = new ethers.JsonRpcProvider(RPC_URL, undefined, { staticNetwork: true });

  const accounts = await provider.send("eth_accounts", []).catch(() => []);

  if (PRIVATE_KEY && PRIVATE_KEY.length > 0) {
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
    signer = wallet;
  } else if (process.env.NODE_ENV !== "production" && accounts.length > 0) {
    console.warn("⚠️ No DEPLOYER_PRIVATE_KEY provided in development. Using local node account.");
    signer = await provider.getSigner(0);
  } else {
    throw new Error("DEPLOYER_PRIVATE_KEY is required for blockchain operations");
  }

  if (!CONTRACT_ADDRESS) {
    throw new Error("Please set HEALTH_CONTRACT_ADDRESS in backend .env");
  }

  contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
  const addr = await signer.getAddress();
  const bal = await provider.getBalance(addr);
  console.log("Blockchain client initialized for contract:", CONTRACT_ADDRESS);
  console.log("Signer:", addr, "Balance:", ethers.formatEther(bal), "ETH");
}

async function registerPatient(patientId) {
  const tx = await contract.registerPatient(patientId);
  return await tx.wait();
}

async function addHealthRecord(patientId, ipfsHash, contentHash) {
  const tx = await contract.addRecord(patientId, ipfsHash, contentHash);
  return await tx.wait();
}

async function grantAccess(patientId, granteeAddress, expiresAt = 0) {
  const tx = await contract.grantAccess(patientId, granteeAddress, expiresAt);
  return await tx.wait();
}

async function revokeAccess(patientId, granteeAddress) {
  const tx = await contract.revokeAccess(patientId, granteeAddress);
  return await tx.wait();
}

async function authorizeEmergency(patientId, responderAddress) {
  const tx = await contract.authorizeEmergency(patientId, responderAddress);
  return await tx.wait();
}

async function emergencyAccess(patientId, reason) {
  const tx = await contract.emergencyAccess(patientId, reason);
  return await tx.wait();
}

async function breakGlassAccess(patientId, hashedToken, reason) {
  const tx = await contract.breakGlassAccess(patientId, hashedToken, reason);
  return await tx.wait();
}

async function setEmergencyToken(patientId, hashedToken) {
  const tx = await contract.setEmergencyToken(patientId, hashedToken);
  return await tx.wait();
}

async function getPatientRecordIds(patientId) {
  const ids = await contract.getRecordIdsForPatient(patientId);
  return ids.map((i) => Number(i));
}

async function checkAccess(patientId, addr) {
  return await contract.hasAccess(patientId, addr);
}

async function getAuditLog(patientId) {
  const count = await contract.getAuditLogCount();
  const logs = [];
  for (let i = 0; i < Number(count); i++) {
    const entry = await contract.getAuditEntry(i);
    if (entry[1] === patientId) {
      logs.push({
        id: Number(entry[0]),
        patientId: entry[1],
        actor: entry[2],
        action: entry[3],
        detail: entry[4],
        timestamp: Number(entry[5]),
      });
    }
  }
  return logs;
}

module.exports = {
  init, registerPatient, addHealthRecord, grantAccess, revokeAccess,
  authorizeEmergency, emergencyAccess, breakGlassAccess, setEmergencyToken,
  getPatientRecordIds, checkAccess, getAuditLog,
};
