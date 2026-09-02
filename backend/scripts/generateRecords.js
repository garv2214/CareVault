// backend/scripts/generateRecords.js
// Script to automatically generate and add multiple health records

const axios = require("axios");
require("dotenv").config();

const API_URL = process.env.API_URL || "http://localhost:5000/api";
const NUM_RECORDS = process.argv[2] ? parseInt(process.argv[2]) : 50;

// Generate random health data
function generateRandomRecord(patientId, index) {
  const symptoms = [
    "fever, cough, headache",
    "fatigue, muscle pain",
    "nausea, dizziness",
    "chest pain, shortness of breath",
    "joint pain, swelling",
    "sore throat, runny nose",
    "abdominal pain, bloating",
    "back pain, stiffness",
    "rash, itching",
    "insomnia, anxiety"
  ];

  const diagnoses = [
    "Common cold",
    "Flu",
    "Hypertension",
    "Diabetes",
    "Arthritis",
    "Migraine",
    "Bronchitis",
    "Gastritis",
    "Anxiety disorder",
    "Seasonal allergies"
  ];

  return {
    age: Math.floor(Math.random() * 60) + 20, // 20-80 years
    systolic_bp: Math.floor(Math.random() * 60) + 100, // 100-160
    diastolic_bp: Math.floor(Math.random() * 30) + 60, // 60-90
    heart_rate: Math.floor(Math.random() * 50) + 60, // 60-110 bpm
    temperature: (Math.random() * 3 + 97).toFixed(1), // 97-100°F
    blood_sugar: Math.floor(Math.random() * 100) + 80, // 80-180 mg/dL
    symptoms: symptoms[Math.floor(Math.random() * symptoms.length)],
    diagnosis: diagnoses[Math.floor(Math.random() * diagnoses.length)],
    notes: `Auto-generated record #${index + 1} for testing purposes. Generated at ${new Date().toISOString()}`,
    timestamp: new Date().toISOString()
  };
}

async function addRecord(patientId, recordData) {
  try {
    const response = await axios.post(`${API_URL}/health`, {
      patientId,
      recordData
    }, {
      headers: { "Content-Type": "application/json" }
    });
    return response.data;
  } catch (error) {
    console.error(`Error adding record for ${patientId}:`, error.message);
    return { success: false, error: error.message };
  }
}

async function generateRecords() {
  console.log(`🚀 Generating ${NUM_RECORDS} health records...\n`);

  const results = {
    success: 0,
    failed: 0,
    errors: []
  };

  for (let i = 0; i < NUM_RECORDS; i++) {
    const patientId = `patient-${String(i + 1).padStart(3, '0')}`; // patient-001, patient-002, etc.
    const recordData = generateRandomRecord(patientId, i);

    process.stdout.write(`\r📝 Adding record ${i + 1}/${NUM_RECORDS} for ${patientId}...`);

    const result = await addRecord(patientId, recordData);

    if (result.success) {
      results.success++;
    } else {
      results.failed++;
      results.errors.push({ patientId, error: result.message || result.error });
    }

    // Small delay to avoid overwhelming the server
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log(`\n\n✅ Generation complete!`);
  console.log(`   ✓ Success: ${results.success}`);
  console.log(`   ✗ Failed: ${results.failed}`);

  if (results.errors.length > 0) {
    console.log(`\n❌ Errors:`);
    results.errors.forEach(err => {
      console.log(`   - ${err.patientId}: ${err.error}`);
    });
  }

  console.log(`\n💡 Records are now available in the frontend!`);
  console.log(`   Refresh your browser to see them.`);
}

// Check if backend is running
async function checkBackend() {
  try {
    const response = await axios.get(`${API_URL.replace('/api', '')}/`, { timeout: 3000 });
    if (response.data && response.data.includes('CareVault')) {
      console.log('✅ Backend is running and responding\n');
      return true;
    }
    throw new Error('Backend responded but with unexpected data');
  } catch (error) {
    if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
      console.error(`\n❌ Cannot connect to backend at http://localhost:5000`);
      console.error(`   The backend server is not running or not responding.\n`);
      console.error(`   To start the backend:`);
      console.error(`   1. Open a new terminal`);
      console.error(`   2. Run: cd backend && node index.js`);
      console.error(`   3. Wait for: "🚀 Backend listening on port 5000"`);
      console.error(`   4. Then run this script again\n`);
    } else {
      console.error(`\n❌ Error connecting to backend: ${error.message}`);
      console.error(`   Make sure backend is running: cd backend && node index.js\n`);
    }
    process.exit(1);
  }
}

// Main execution
(async () => {
  await checkBackend();
  await generateRecords();
})();

