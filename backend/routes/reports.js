const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const router = express.Router();
router.use(protect);

router.get("/", (req, res) => res.json({ reports: [
  { id: "headcount", name: "Headcount Report" },
  { id: "attrition", name: "Attrition Analysis" },
  { id: "performance", name: "Performance Summary" },
  { id: "compensation", name: "Compensation Audit" },
]}));

router.get("/:id", (req, res) => res.json({ reportId: req.params.id, status: "ready" }));

module.exports = router;
