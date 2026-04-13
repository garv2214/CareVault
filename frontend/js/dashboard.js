// dashboard.js - Integration for doctor_dashboard HTML
import { connectCareVaultWallet, getWallet, healthAPI } from './wallet.js';

let currentWallet = null;

// Load records for sample patients
const samplePatients = ['0x4a92e281', '0x81f2e99bc', '0x33e112d4'];

async function loadRecords(patientId) {
  try {
    const data = await healthAPI.getRecords(patientId);
    const tbody = document.getElementById('recordsTable');
    tbody.innerHTML = '';

    data.records.forEach(record => {
      const row = document.createElement('tr');
      row.className = 'bg-surface-container-lowest group hover:translate-y-[-2px] transition-transform duration-200 shadow-sm';
      row.innerHTML = `
        <td class="px-6 py-5 rounded-l-xl">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-full bg-primary-fixed flex items-center justify-center text-primary text-xs font-bold">JD</div>
            <div>
              <p class="font-bold text-sm">${patientId.slice(0,6)}...</p>
              <p class="text-[10px] text-slate-400 font-mono">${patientId}</p>
            </div>
          </div>
        </td>
        <td class="px-6 py-5">
          <span class="px-3 py-1 bg-surface-container-high rounded-full text-xs font-medium">Health Record</span>
        </td>
        <td class="px-6 py-5 text-sm text-on-surface-variant">${new Date(record.uploadedAt).toLocaleDateString()}</td>
        <td class="px-6 py-5 rounded-r-xl text-right">
          <div class="flex justify-end gap-2">
            <button class="p-2 rounded-lg hover:bg-blue-50 text-blue-600" onclick="viewRecord('${record.ipfsHash}')">
              <span class="material-symbols-outlined text-xl" data-icon="visibility">visibility</span>
            </button>
            <button class="p-2 rounded-lg hover:bg-blue-50 text-blue-600" onclick="downloadRecord('${record.ipfsHash}')">
              <span class="material-symbols-outlined text-xl" data-icon="download">download</span>
            </button>
          </div>
        </td>
      `;
      tbody.appendChild(row);
    });
  } catch (err) {
    console.error('Load records error:', err);
  }
}

async function sendRequest() {
  const patientId = document.getElementById('patientInput').value;
  const purpose = document.getElementById('purposeSelect').value;
  
  if (!currentWallet) {
    alert('Connect wallet first');
    return;
  }
  
  try {
    const result = await healthAPI.requestAccess({
      patientId,
      doctorAddress: currentWallet.address,
      purpose
    });
    alert('Request sent! ID: ' + result.requestId);
  } catch (err) {
    alert('Error: ' + err.message);
  }
}

async function triggerEmergency() {
  if (!currentWallet) {
    alert('Connect wallet first');
    return;
  }
  
  const reason = prompt('Emergency reason:');
  if (!reason) return;
  
  try {
    const result = await healthAPI.triggerEmergency({
      patientId: '0x4a92e281', // sample
      reason
    });
    alert('Emergency triggered! Tx: ' + result.txHash);
  } catch (err) {
    alert('Error: ' + err.message);
  }
}

// Global functions for onclick
window.connectCareVaultWallet = connectCareVaultWallet;
window.loadRecords = loadRecords;
window.sendRequest = sendRequest;
window.triggerEmergency = triggerEmergency;
window.viewRecord = (hash) => alert('View IPFS: ' + hash);
window.downloadRecord = (hash) => alert('Download IPFS: ' + hash);

// Auto load sample records
document.addEventListener('DOMContentLoaded', () => {
  loadRecords(samplePatients[0]);
});
