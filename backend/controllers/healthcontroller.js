// Placeholder database (to be replaced with MongoDB or Blockchain/IPFS)
let recordsDB = [];

// GET all health records
exports.getAllRecords = (req, res) => {
  res.status(200).json({
    success: true,
    data: recordsDB,
  });
};

// POST new record
exports.addRecord = async (req, res) => {
  try {
    const { patientId, recordData } = req.body;

    if (!patientId || !recordData) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    // TEMPORARY – Save locally
    recordsDB.push({ patientId, recordData, date: new Date() });

    return res.status(201).json({
      success: true,
      message: "Record added successfully",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: err.message,
    });
  }
};

// Emergency Summary (AI + Blockchain Placeholder)
exports.getEmergencySummary = async (req, res) => {
  const { patientId } = req.params;

  // Find patient record
  const userRecord = recordsDB.find((r) => r.patientId === patientId);

  if (!userRecord) {
    return res.status(404).json({
      success: false,
      message: "Patient record not found",
    });
  }

  // Placeholder: emergency summary
  const summary = {
    patientId,
    summary: "This is a placeholder AI-generated emergency summary.",
    conditions: ["Hypertension", "Diabetes"],
    lastUpdated: new Date(),
  };

  return res.status(200).json({
    success: true,
    summary,
  });
};
