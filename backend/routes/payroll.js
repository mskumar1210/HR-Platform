const express = require("express");
const { protect, authorize } = require("../middleware/authMiddleware");
const router = express.Router();
router.use(protect);
router.use(authorize("super_admin","hr_manager","analyst"));

router.get("/", (req, res) => res.json({ message: "Payroll routes active", data: [] }));
router.get("/summary", (req, res) => res.json({
  totalPayrollMonthly: 8540000,
  avgNetPay: 7120,
  totalBonuses: 342000,
  totalBenefits: 891000,
  payrollGrowthYoY: 8.4,
}));

module.exports = router;
