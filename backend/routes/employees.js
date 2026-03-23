const express = require("express");
const { body, query, param, validationResult } = require("express-validator");
const Employee = require("../models/Employee");
const { protect, authorize } = require("../middleware/authMiddleware");
const logger = require("../utils/logger");

const router = express.Router();
router.use(protect);

// ─── GET /api/employees ───────────────────────────────────────────────────────
router.get("/", [
  query("page").optional().isInt({ min: 1 }),
  query("limit").optional().isInt({ min: 1, max: 100 }),
  query("department").optional().isString(),
  query("status").optional().isString(),
  query("search").optional().isString(),
  query("sortBy").optional().isString(),
  query("sortOrder").optional().isIn(["asc", "desc"]),
  query("minSalary").optional().isNumeric(),
  query("maxSalary").optional().isNumeric(),
  query("skills").optional().isString(),
], async (req, res) => {
  try {
    const page   = parseInt(req.query.page)  || 1;
    const limit  = parseInt(req.query.limit) || 20;
    const skip   = (page - 1) * limit;
    const filter = {};

    if (req.query.department) filter.department = req.query.department;
    if (req.query.status)     filter.employmentStatus = req.query.status;
    if (req.query.skills)     filter.skills = { $in: req.query.skills.split(",") };
    if (req.query.minSalary || req.query.maxSalary) {
      filter.salary = {};
      if (req.query.minSalary) filter.salary.$gte = parseFloat(req.query.minSalary);
      if (req.query.maxSalary) filter.salary.$lte = parseFloat(req.query.maxSalary);
    }
    if (req.query.search) {
      filter.$text = { $search: req.query.search };
    }

    const sortField = req.query.sortBy || "createdAt";
    const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;

    const [employees, total] = await Promise.all([
      Employee.find(filter)
        .sort({ [sortField]: sortOrder })
        .skip(skip)
        .limit(limit)
        .lean(),
      Employee.countDocuments(filter),
    ]);

    res.json({
      employees,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    logger.error("GET employees error:", err);
    res.status(500).json({ error: "Failed to fetch employees" });
  }
});

// ─── GET /api/employees/stats ─────────────────────────────────────────────────
router.get("/stats", async (req, res) => {
  try {
    const [deptStats, statusStats, salaryStats, riskStats] = await Promise.all([
      Employee.aggregate([{ $group: { _id: "$department", count: { $sum: 1 }, avgSalary: { $avg: "$salary" } } }, { $sort: { count: -1 } }]),
      Employee.aggregate([{ $group: { _id: "$employmentStatus", count: { $sum: 1 } } }]),
      Employee.aggregate([{ $group: { _id: null, avg: { $avg: "$salary" }, min: { $min: "$salary" }, max: { $max: "$salary" }, total: { $sum: "$salary" } } }]),
      Employee.aggregate([
        { $match: { attritionRisk: { $gte: 0.7 } } },
        { $group: { _id: "$department", highRiskCount: { $sum: 1 } } },
        { $sort: { highRiskCount: -1 } }
      ]),
    ]);
    res.json({ deptStats, statusStats, salaryStats: salaryStats[0], riskStats });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

// ─── GET /api/employees/:id ───────────────────────────────────────────────────
router.get("/:id", param("id").isString(), async (req, res) => {
  try {
    const employee = await Employee.findOne({
      $or: [{ _id: req.params.id.match(/^[a-f\d]{24}$/i) ? req.params.id : null }, { employeeId: req.params.id }],
    });
    if (!employee) return res.status(404).json({ error: "Employee not found" });
    res.json(employee);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch employee" });
  }
});

// ─── POST /api/employees ──────────────────────────────────────────────────────
router.post("/", authorize("super_admin", "hr_manager"), [
  body("firstName").trim().notEmpty(),
  body("lastName").trim().notEmpty(),
  body("email").isEmail().normalizeEmail(),
  body("department").notEmpty(),
  body("role").notEmpty(),
  body("salary").isNumeric({ min: 0 }),
  body("hireDate").isISO8601(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const count = await Employee.countDocuments();
    const employeeId = `EMP${String(count + 2001).padStart(5, "0")}`;
    const employee = await Employee.create({ ...req.body, employeeId });
    logger.info(`Employee created: ${employeeId}`);
    res.status(201).json(employee);
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ error: "Employee ID or email already exists" });
    res.status(500).json({ error: "Failed to create employee" });
  }
});

// ─── PATCH /api/employees/:id ─────────────────────────────────────────────────
router.patch("/:id", authorize("super_admin", "hr_manager", "manager"), async (req, res) => {
  try {
    const forbidden = ["employeeId", "_id"];
    forbidden.forEach((f) => delete req.body[f]);

    const employee = await Employee.findOneAndUpdate(
      { $or: [{ employeeId: req.params.id }, { _id: req.params.id.match(/^[a-f\d]{24}$/i) ? req.params.id : null }] },
      req.body,
      { new: true, runValidators: true }
    );
    if (!employee) return res.status(404).json({ error: "Employee not found" });
    res.json(employee);
  } catch (err) {
    res.status(500).json({ error: "Failed to update employee" });
  }
});

// ─── DELETE /api/employees/:id ────────────────────────────────────────────────
router.delete("/:id", authorize("super_admin"), async (req, res) => {
  try {
    const employee = await Employee.findOneAndDelete({ employeeId: req.params.id });
    if (!employee) return res.status(404).json({ error: "Employee not found" });
    logger.info(`Employee deleted: ${req.params.id}`);
    res.json({ message: "Employee deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete employee" });
  }
});

module.exports = router;
