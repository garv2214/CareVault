const { JsonRpcProvider, Wallet, Contract } = require("ethers");
require("dotenv").config();

const RPC_URL = process.env.ETH_RPC_URL || "http://127.0.0.1:8545";
const PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY || "";
const CONTRACT_ADDRESS = process.env.HEALTH_CONTRACT_ADDRESS || "";

// ABI (same as before)
const CONTRACT_ABI = [
  "function addRecord(string _patientId, string _ipfsHash) external",
  "function getRecordCount() external view returns (uint256)",
  "function getRecordById(uint256) external view returns (uint256, string, string, uint256, address)",
  "function getRecordIdsForPatient(string _patientId) external view returns (uint256[])",
  "function grantAccess(string _patientId, address _grantee) external",
  "function hasAccess(string _patientId, address _addr) external view returns (bool)",
  "function emergencyAccess(string _patientId, string _reason) external"
];

let provider;
let signer;
let contract;

async function init() {
  console.log("Initializing blockchain client…");

  provider = new JsonRpcProvider(RPC_URL);

  if (PRIVATE_KEY && PRIVATE_KEY.length > 0) {
    signer = new Wallet(PRIVATE_KEY, provider);
  } else {
    const accounts = await provider.listAccounts();
    if (accounts.length === 0) {
      throw new Error("No accounts available from provider");
    }
    signer = provider.getSigner(accounts[0].address);
  }

  if (!CONTRACT_ADDRESS) {
    throw new Error("HEALTH_CONTRACT_ADDRESS missing in backend .env");
  }

  contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

  console.log("✅ Blockchain client initialized for:", CONTRACT_ADDRESS);
}

async function addHealthRecord(patientId, ipfsHash) {
  const tx = await contract.addRecord(patientId, ipfsHash);
  return await tx.wait();
}

async function getPatientRecordIds(patientId) {
  const ids = await contract.getRecordIdsForPatient(patientId);
  return ids.map(id => Number(id)); // convert BigInt -> int
}

async function checkAccess(patientId, addr) {
  return await contract.hasAccess(patientId, addr);
}

module.exports = { init, addHealthRecord, getPatientRecordIds, checkAccess };
