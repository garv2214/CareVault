const express = require("express");
const router = express.Router();
const { getPrediction, classify, federatedStatus } = require("../controllers/aiController");
const { authMiddleware } = require("../middleware/auth");

router.post("/predict", authMiddleware, getPrediction);
router.post("/classify", authMiddleware, classify);
router.get("/federated/status", federatedStatus);

module.exports = router;
