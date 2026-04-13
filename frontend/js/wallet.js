// frontend/js/wallet.js - Wallet connect + contract utils for HTML
import { ethers } from 'https://cdn.ethers.io/lib/ethers-6.15.0.umd.min.js';
import { healthAPI } from './api.js';

let wallet = null;
let provider = null;
let signer = null;
let contract = null;

export async function connectWallet() {
  if (typeof window.ethereum !== 'undefined') {
    provider = new ethers.BrowserProvider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    signer = await provider.getSigner();
    wallet = {
      address: await signer.getAddress(),
      signer
    };

    const abiResp = await healthAPI.getABI();
    const abi = abiResp.abi;
    // CONTRACT_ADDRESS from backend .env or hardcode local
    const CONTRACT_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3'; // update with your deployed
    contract = new ethers.Contract(CONTRACT_ADDRESS, abi, signer);
    
    console.log('Wallet connected:', wallet.address);
    return wallet;
  } else {
    throw new Error('MetaMask not found');
  }
}

export function getWallet() {
  return wallet;
}

export async function getPatientRecords(patientId) {
  const resp = await healthAPI.getRecords(patientId);
  return resp.records;
}

export async function requestAccess(patientId, purpose) {
  const wallet = getWallet();
  if (!wallet) throw new Error('Connect wallet first');
  const resp = await healthAPI.requestAccess({
    patientId,
    doctorAddress: wallet.address,
    purpose
  });
  return resp;
}

export async function triggerEmergency(patientId, reason) {
  const wallet = getWallet();
  if (!wallet) throw new Error('Connect wallet first');
  const resp = await healthAPI.triggerEmergency({
    patientId,
    reason
  });
  return resp;
}

window.connectCareVaultWallet = connectWallet;
