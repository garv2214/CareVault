const { ethers } = require("ethers");
require("dotenv").config();

const RPC_URL = process.env.ETH_RPC_URL || "http://127.0.0.1:8545";
const PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY || ""; // for signing txs when calling contract methods
const CONTRACT_ADDRESS = process.env.HEALTH_CONTRACT_ADDRESS || ""; // set after deploy
const CONTRACT_ABI = [
  // minimal ABI subset we will use
  "function addRecord(string _patientId, string _ipfsHash) external",
  "function getRecordCount() external view returns (uint256)",
  "function getRecordById(uint256) external view returns (uint256, string memory, string memory, uint256, address)",
  "function getRecordIdsForPatient(string _patientId) external view returns (uint256[])",
  "function grantAccess(string _patientId, address _grantee) external",
  "function hasAccess(string _patientId, address _addr) external view returns (bool)",
  "function emergencyAccess(string _patientId, string _reason) external"
];

let provider;
let signer;
let contract;

async function init() {
  provider = new ethers.JsonRpcProvider(RPC_URL);

  if (PRIVATE_KEY && PRIVATE_KEY.length > 0) {
    signer = new ethers.Wallet(PRIVATE_KEY, provider);
  } else {
    // if no private key, use first account from node
    const accounts = await provider.send("eth_accounts", []);
    if (accounts.length === 0) {
      // fallback — request accounts (works in hardhat)
      const accountList = await provider.send("eth_accounts", []);
      signer = provider.getSigner(accountList[0]);
    } else {
      signer = provider.getSigner(accounts[0]);
    }
  }

  if (!CONTRACT_ADDRESS) {
    throw new Error("Please set HEALTH_CONTRACT_ADDRESS in backend .env");
  }

  contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
  console.log("Blockchain client initialized for contract:", CONTRACT_ADDRESS);
}

async function addHealthRecord(patientId, ipfsHash) {
  // sends a transaction to add record metadata on-chain
  const tx = await contract.addRecord(patientId, ipfsHash);
  const receipt = await tx.wait();
  return receipt;
}

async function getPatientRecordIds(patientId) {
  const ids = await contract.getRecordIdsForPatient(patientId);
  // ids will be an array of BigInt -> convert to numbers
  return ids.map(i => Number(i));
}

async function checkAccess(patientId, addr) {
  return await contract.hasAccess(patientId, addr);
}

module.exports = { init, addHealthRecord, getPatientRecordIds, checkAccess };
