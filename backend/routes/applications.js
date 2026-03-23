const express = require("express");
const JobApplication = require("../models/JobApplication");
const { protect, authorize } = require("../middleware/authMiddleware");
const { body, validationResult } = require("express-validator");
const router = express.Router();
router.use(protect);

router.get("/", async (req, res) => {
  try {
    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 20;
    const filter = {};
    if (req.query.status)     filter.status = req.query.status;
    if (req.query.department) filter.department = req.query.department;
    if (req.query.jobTitle)   filter.jobTitle = req.query.jobTitle;

    const [applications, total] = await Promise.all([
      JobApplication.find(filter).sort({ appliedDate: -1 }).skip((page-1)*limit).limit(limit).lean(),
      JobApplication.countDocuments(filter)
    ]);
    res.json({ applications, pagination: { page, limit, total, pages: Math.ceil(total/limit) } });
  } catch (err) { res.status(500).json({ error: "Failed to fetch applications" }); }
});

router.get("/:id", async (req, res) => {
  try {
    const app = await JobApplication.findOne({ applicationId: req.params.id });
    if (!app) return res.status(404).json({ error: "Application not found" });
    res.json(app);
  } catch (err) { res.status(500).json({ error: "Fetch failed" }); }
});

router.post("/", authorize("super_admin","hr_manager","recruiter"), [
  body("candidateName").notEmpty(),
  body("email").isEmail(),
  body("jobTitle").notEmpty(),
  body("department").notEmpty(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  try {
    const count = await JobApplication.countDocuments();
    const applicationId = `APP${String(count + 20001).padStart(6, "0")}`;
    const app = await JobApplication.create({ ...req.body, applicationId });
    res.status(201).json(app);
  } catch (err) { res.status(500).json({ error: "Create failed" }); }
});

router.patch("/:id", authorize("super_admin","hr_manager","recruiter"), async (req, res) => {
  try {
    const app = await JobApplication.findOneAndUpdate({ applicationId: req.params.id }, req.body, { new: true });
    if (!app) return res.status(404).json({ error: "Not found" });
    res.json(app);
  } catch (err) { res.status(500).json({ error: "Update failed" }); }
});

router.delete("/:id", authorize("super_admin","hr_manager"), async (req, res) => {
  try {
    await JobApplication.findOneAndDelete({ applicationId: req.params.id });
    res.json({ message: "Deleted" });
  } catch (err) { res.status(500).json({ error: "Delete failed" }); }
});

module.exports = router;
