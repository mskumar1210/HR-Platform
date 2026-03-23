// performance.js
const express = require("express");
const PerformanceReview = require("../models/PerformanceReview");
const { protect } = require("../middleware/authMiddleware");
const router = express.Router();
router.use(protect);

router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const filter = {};
    if (req.query.employeeId) filter.employeeId = req.query.employeeId;
    if (req.query.period)     filter.reviewPeriod = req.query.period;
    const [reviews, total] = await Promise.all([
      PerformanceReview.find(filter).sort({ reviewDate: -1 }).skip((page-1)*limit).limit(limit).lean(),
      PerformanceReview.countDocuments(filter)
    ]);
    res.json({ reviews, pagination: { page, limit, total, pages: Math.ceil(total/limit) } });
  } catch (err) { res.status(500).json({ error: "Failed" }); }
});

router.get("/:id", async (req, res) => {
  try {
    const r = await PerformanceReview.findOne({ reviewId: req.params.id });
    if (!r) return res.status(404).json({ error: "Review not found" });
    res.json(r);
  } catch (err) { res.status(500).json({ error: "Fetch failed" }); }
});

router.post("/", async (req, res) => {
  try {
    const count = await PerformanceReview.countDocuments();
    const reviewId = `REV${String(count + 2001).padStart(5, "0")}`;
    const r = await PerformanceReview.create({ ...req.body, reviewId });
    res.status(201).json(r);
  } catch (err) { res.status(500).json({ error: "Create failed" }); }
});

router.patch("/:id", async (req, res) => {
  try {
    const r = await PerformanceReview.findOneAndUpdate({ reviewId: req.params.id }, req.body, { new: true });
    if (!r) return res.status(404).json({ error: "Not found" });
    res.json(r);
  } catch (err) { res.status(500).json({ error: "Update failed" }); }
});

module.exports = router;
