const express = require("express");
const router = express.Router();
const {
  getMedications, addMedication, updateMedication, deleteMedication,
  getArticles, getArticle, addArticle, getNotifications,
} = require("../controllers/contentController");
const { authMiddleware, requireRole } = require("../middleware/auth");

router.get("/medications", authMiddleware, getMedications);
router.post("/medications", authMiddleware, addMedication);
router.put("/medications/:id", authMiddleware, updateMedication);
router.delete("/medications/:id", authMiddleware, deleteMedication);
router.get("/articles", getArticles);
router.get("/articles/:id", getArticle);
router.post("/articles", authMiddleware, requireRole("admin"), addArticle);
router.get("/notifications", authMiddleware, getNotifications);

module.exports = router;
