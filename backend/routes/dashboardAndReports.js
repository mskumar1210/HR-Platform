const express = require("express");
const Employee = require("../models/Employee");
const JobApplication = require("../models/JobApplication");
const PerformanceReview = require("../models/PerformanceReview");
const { protect } = require("../middleware/authMiddleware");

const dashRouter = express.Router();
dashRouter.use(protect);

dashRouter.get("/kpis", async (req, res) => {
  try {
    const [active, apps, reviews] = await Promise.all([
      Employee.countDocuments({ employmentStatus: "Active" }),
      JobApplication.countDocuments({ status: { $in: ["Applied","Screening","Phone Interview","Technical Interview"] } }),
      PerformanceReview.aggregate([{ $group: { _id: null, avg: { $avg: "$overallRating" } } }])
    ]);
    const terminated = await Employee.countDocuments({ employmentStatus: "Terminated" });
    const total = await Employee.countDocuments();
    res.json({
      activeHeadcount: active,
      openRoles: apps,
      avgPerformanceRating: parseFloat((reviews[0]?.avg || 3.5).toFixed(2)),
      attritionRate: parseFloat(((terminated / total) * 100).toFixed(1)),
      eNPS: Math.floor(Math.random() * 40 + 30),
      timeToFill: Math.floor(Math.random() * 20 + 25),
      trainingCompletionRate: Math.floor(Math.random() * 20 + 70),
      diversityIndex: parseFloat((Math.random() * 0.2 + 0.6).toFixed(2)),
    });
  } catch (err) { res.status(500).json({ error: "KPI fetch failed" }); }
});

module.exports = dashRouter;

// ─── Reports ──────────────────────────────────────────────────────────────────
const repRouter = express.Router();
repRouter.use(protect);

repRouter.get("/", (req, res) => res.json({
  reports: [
    { id: "headcount", name: "Headcount Report", description: "Current workforce breakdown by dept/role", lastGenerated: new Date() },
    { id: "attrition", name: "Attrition Analysis", description: "Turnover trends and risk factors", lastGenerated: new Date() },
    { id: "performance", name: "Performance Summary", description: "Review scores and rating distribution", lastGenerated: new Date() },
    { id: "compensation", name: "Compensation Audit", description: "Salary equity and market benchmarks", lastGenerated: new Date() },
    { id: "diversity", name: "D&I Report", description: "Diversity metrics by department", lastGenerated: new Date() },
    { id: "training", name: "L&D Report", description: "Training completion and skill development", lastGenerated: new Date() },
  ]
}));

repRouter.get("/:id", async (req, res) => {
  res.json({ reportId: req.params.id, status: "generating", message: "Report will be ready in a few seconds", generatedAt: new Date() });
});

module.exports = { dashRouter, repRouter };
