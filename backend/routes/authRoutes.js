const express = require("express");
const router = express.Router();
const { sendOtp, verifyOtp, register, getProfile, updateProfile } = require("../controllers/authController");
const { authMiddleware } = require("../middleware/auth");

router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.post("/register", register);
router.get("/profile", authMiddleware, getProfile);
router.put("/profile", authMiddleware, updateProfile);

module.exports = router;
