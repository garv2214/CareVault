// scripts/addTestRecords.js
// Frontend script to add multiple test records via browser console

// Usage: Copy and paste this into browser console (F12)

async function generateRandomRecord(patientId, index) {
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
    age: Math.floor(Math.random() * 60) + 20,
    systolic_bp: Math.floor(Math.random() * 60) + 100,
    diastolic_bp: Math.floor(Math.random() * 30) + 60,
    heart_rate: Math.floor(Math.random() * 50) + 60,
    temperature: (Math.random() * 3 + 97).toFixed(1),
    blood_sugar: Math.floor(Math.random() * 100) + 80,
    symptoms: symptoms[Math.floor(Math.random() * symptoms.length)],
    diagnosis: diagnoses[Math.floor(Math.random() * diagnoses.length)],
    notes: `Auto-generated record #${index + 1}`,
    timestamp: new Date().toISOString()
  };
}

async function addTestRecords(count = 50) {
  console.log(`🚀 Adding ${count} test records...`);
  
  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";
  let success = 0;
  let failed = 0;

  for (let i = 0; i < count; i++) {
    const patientId = `patient-${String(i + 1).padStart(3, '0')}`;
    const recordData = await generateRandomRecord(patientId, i);

    try {
      const response = await fetch(`${API_URL}/health`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientId, recordData })
      });

      const result = await response.json();
      
      if (result.success) {
        success++;
        console.log(`✓ ${i + 1}/${count}: ${patientId} - Added`);
      } else {
        failed++;
        console.error(`✗ ${i + 1}/${count}: ${patientId} - ${result.message}`);
      }
    } catch (error) {
      failed++;
      console.error(`✗ ${i + 1}/${count}: ${patientId} - ${error.message}`);
    }

    // Small delay
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  console.log(`\n✅ Complete! Success: ${success}, Failed: ${failed}`);
  console.log(`💡 Refresh the page to see the records!`);
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { addTestRecords, generateRandomRecord };
}

