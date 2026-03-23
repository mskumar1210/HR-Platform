const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const router = express.Router();
router.use(protect);

// Simple CRUD placeholder for training records
// Extend with TrainingRecord model as needed
router.get("/", (req, res) => res.json({ message: "Training routes active", data: [] }));
router.get("/stats", (req, res) => res.json({
  totalEnrollments: 800,
  completed: 360,
  inProgress: 160,
  aiRecommended: 320,
  totalCost: 245000,
  avgHoursPerEmployee: 32,
}));

module.exports = router;
