const express = require("express");
const Employee = require("../models/Employee");
const JobApplication = require("../models/JobApplication");
const PerformanceReview = require("../models/PerformanceReview");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();
router.use(protect);

// ─── GET /api/analytics/overview ─────────────────────────────────────────────
router.get("/overview", async (req, res) => {
  try {
    const [
      totalEmployees, activeEmployees, newHiresThisMonth, avgSalary,
      totalApplications, openPositions, avgSatisfaction, highRiskEmployees
    ] = await Promise.all([
      Employee.countDocuments(),
      Employee.countDocuments({ employmentStatus: "Active" }),
      Employee.countDocuments({ hireDate: { $gte: new Date(new Date().setDate(1)) } }),
      Employee.aggregate([{ $match: { employmentStatus: "Active" } }, { $group: { _id: null, avg: { $avg: "$salary" } } }]),
      JobApplication.countDocuments(),
      JobApplication.countDocuments({ status: { $in: ["Applied","Screening","Phone Interview","Technical Interview"] } }),
      Employee.aggregate([{ $match: { employmentStatus: "Active" } }, { $group: { _id: null, avg: { $avg: "$satisfactionScore" } } }]),
      Employee.countDocuments({ attritionRisk: { $gte: 0.7 }, employmentStatus: "Active" }),
    ]);

    res.json({
      totalEmployees,
      activeEmployees,
      newHiresThisMonth,
      avgSalary: Math.round(avgSalary[0]?.avg || 0),
      totalApplications,
      openPositions,
      avgSatisfaction: parseFloat((avgSatisfaction[0]?.avg || 0).toFixed(1)),
      highRiskEmployees,
      attritionRate: parseFloat(((totalEmployees - activeEmployees) / totalEmployees * 100).toFixed(1)),
    });
  } catch (err) {
    res.status(500).json({ error: "Analytics fetch failed" });
  }
});

// ─── GET /api/analytics/headcount-trend ──────────────────────────────────────
router.get("/headcount-trend", async (req, res) => {
  try {
    const months = [];
    for (let i = 11; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const start = new Date(date.getFullYear(), date.getMonth(), 1);
      const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      const count = await Employee.countDocuments({ hireDate: { $lte: end }, $or: [{ employmentStatus: "Active" }, { updatedAt: { $gte: end } }] });
      months.push({ month: start.toLocaleString("default", { month: "short", year: "2-digit" }), count });
    }
    res.json(months);
  } catch (err) {
    res.status(500).json({ error: "Headcount trend failed" });
  }
});

// ─── GET /api/analytics/salary-distribution ──────────────────────────────────
router.get("/salary-distribution", async (req, res) => {
  try {
    const data = await Employee.aggregate([
      { $match: { employmentStatus: "Active" } },
      {
        $bucket: {
          groupBy: "$salary",
          boundaries: [0, 60000, 80000, 100000, 120000, 150000, 200000, 300000],
          default: "300000+",
          output: { count: { $sum: 1 }, avgSalary: { $avg: "$salary" } }
        }
      }
    ]);
    const labels = ["<60k", "60-80k", "80-100k", "100-120k", "120-150k", "150-200k", "200-300k", "300k+"];
    res.json(data.map((d, i) => ({ range: labels[i] || "300k+", count: d.count, avgSalary: Math.round(d.avgSalary || 0) })));
  } catch (err) {
    res.status(500).json({ error: "Salary distribution failed" });
  }
});

// ─── GET /api/analytics/department-performance ───────────────────────────────
router.get("/department-performance", async (req, res) => {
  try {
    const data = await PerformanceReview.aggregate([
      {
        $group: {
          _id: null,
          avgRating: { $avg: "$overallRating" },
          avgGoals: { $avg: "$goalsAchievedPct" },
          count: { $sum: 1 }
        }
      }
    ]);
    
    const deptData = await Employee.aggregate([
      { $match: { employmentStatus: "Active" } },
      {
        $group: {
          _id: "$department",
          headcount: { $sum: 1 },
          avgSalary: { $avg: "$salary" },
          avgSatisfaction: { $avg: "$satisfactionScore" },
          avgAttritionRisk: { $avg: "$attritionRisk" },
        }
      },
      { $sort: { headcount: -1 } }
    ]);
    res.json(deptData);
  } catch (err) {
    res.status(500).json({ error: "Department analytics failed" });
  }
});

// ─── GET /api/analytics/hiring-funnel ────────────────────────────────────────
router.get("/hiring-funnel", async (req, res) => {
  try {
    const statuses = ["Applied","Screening","Phone Interview","Technical Interview","Offer Extended","Hired"];
    const data = await Promise.all(
      statuses.map(async (status) => ({
        stage: status,
        count: await JobApplication.countDocuments({ status })
      }))
    );
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Hiring funnel failed" });
  }
});

// ─── GET /api/analytics/skills-gap ───────────────────────────────────────────
router.get("/skills-gap", async (req, res) => {
  try {
    const data = await Employee.aggregate([
      { $match: { employmentStatus: "Active" } },
      { $unwind: "$skills" },
      { $group: { _id: "$skills", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 20 }
    ]);
    res.json(data.map(d => ({ skill: d._id, count: d.count })));
  } catch (err) {
    res.status(500).json({ error: "Skills analysis failed" });
  }
});

module.exports = router;
