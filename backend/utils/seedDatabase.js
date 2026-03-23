// ─── TalentIQ Database Seeder (Fixed) ────────────────────────────────────────
require("dotenv").config();
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

// ── Models ────────────────────────────────────────────────────────────────────
const Employee        = require("../models/Employee");
const JobApplication  = require("../models/JobApplication");
const PerformanceReview = require("../models/PerformanceReview");
const User            = require("../models/User");

const DATA_DIR = path.join(__dirname, "../../data");

// ── CSV Parser ────────────────────────────────────────────────────────────────
function parseCSV(filePath) {
  const content = fs.readFileSync(filePath, "utf-8");
  const lines   = content.trim().split("\n");
  const headers = lines[0].split(",").map(h => h.trim());
  return lines.slice(1).map(line => {
    // handle commas inside quoted fields
    const values = [];
    let cur = "", inQ = false;
    for (const ch of line) {
      if (ch === '"') { inQ = !inQ; }
      else if (ch === "," && !inQ) { values.push(cur.trim()); cur = ""; }
      else cur += ch;
    }
    values.push(cur.trim());
    const obj = {};
    headers.forEach((h, i) => { obj[h] = values[i] ?? ""; });
    return obj;
  });
}

function toCamel(str) {
  return str.replace(/_([a-z])/g, (_, l) => l.toUpperCase());
}
function transformKeys(obj) {
  const r = {};
  Object.entries(obj).forEach(([k, v]) => { r[toCamel(k)] = v; });
  return r;
}

// ── 1. Users ──────────────────────────────────────────────────────────────────
async function seedUsers() {
  await User.deleteMany({});
  const users = [
    { name: "Alex Morgan", email: "admin@talentiq.com",     password: "Admin@1234", role: "super_admin",  department: "HR"           },
    { name: "Sarah Chen",  email: "hr@talentiq.com",        password: "Admin@1234", role: "hr_manager",   department: "HR"           },
    { name: "Mike Davis",  email: "recruiter@talentiq.com", password: "Admin@1234", role: "recruiter",    department: "HR"           },
    { name: "Lisa Park",   email: "manager@talentiq.com",   password: "Admin@1234", role: "manager",      department: "Engineering"  },
    { name: "Tom Wilson",  email: "analyst@talentiq.com",   password: "Admin@1234", role: "analyst",      department: "Data Science" },
  ];
  await User.insertMany(users);
  console.log("✅ Users seeded: 5");
  console.log("   Default credentials → email: admin@talentiq.com | password: Admin@1234");
}

// ── 2. Employees ──────────────────────────────────────────────────────────────
async function seedEmployees() {
  const rows = parseCSV(path.join(DATA_DIR, "employees.csv"));
  const docs = rows.map(r => {
    const t = transformKeys(r);
    return {
      employeeId:           t.employeeId,
      firstName:            t.firstName,
      lastName:             t.lastName,
      email:                t.email,
      department:           t.department,
      role:                 t.role,
      hireDate:             new Date(t.hireDate),
      salary:               parseFloat(t.salary)          || 0,
      city:                 t.city,
      state:                t.state,
      educationLevel:       t.educationLevel              || "Bachelor's",
      university:           t.university,
      yearsExperience:      parseInt(t.yearsExperience)   || 0,
      skills:               t.skills ? t.skills.split("|") : [],
      performanceRating:    t.performanceRating           || "Meets Expectations",
      employmentStatus:     t.employmentStatus            || "Active",
      managerId:            t.managerId,
      remoteWork:           t.remoteWork,
      satisfactionScore:    parseFloat(t.satisfactionScore) || 5,
      tenureMonths:         parseInt(t.tenureMonths)      || 0,
      promotionsCount:      parseInt(t.promotionsCount)   || 0,
      trainingHoursYtd:     parseInt(t.trainingHoursYtd)  || 0,
      overtimeHoursMonthly: parseInt(t.overtimeHoursMonthly) || 0,
      attritionRisk:        parseFloat((Math.random() * 0.5).toFixed(3)),
    };
  });

  await Employee.deleteMany({});
  // Use ordered:false so duplicates are skipped instead of stopping the whole insert
  const result = await Employee.insertMany(docs, { ordered: false }).catch(e => {
    if (e.code === 11000) return { insertedCount: e.result?.nInserted || docs.length - (e.writeErrors?.length || 0) };
    throw e;
  });
  console.log(`✅ Employees seeded: ${result.insertedCount ?? docs.length}`);
}

// ── 3. Applications ───────────────────────────────────────────────────────────
async function seedApplications() {
  const rows = parseCSV(path.join(DATA_DIR, "job_applications.csv"));
  const docs = rows.map(r => {
    const t = transformKeys(r);
    return {
      applicationId:        t.applicationId,
      candidateName:        t.candidateName,
      email:                t.email,
      jobTitle:             t.jobTitle,
      department:           t.department,
      appliedDate:          new Date(t.appliedDate),
      source:               t.source,
      status:               t.status,
      yearsExperience:      parseInt(t.yearsExperience)       || 0,
      educationLevel:       t.educationLevel,
      skillsMatchScore:     parseFloat(t.skillsMatchScore)    || 50,
      aiCompatibilityScore: parseFloat(t.aiCompatibilityScore) || 50,
      interviewScore:       parseFloat(t.interviewScore)      || undefined,
      resumeKeywordsMatched:parseInt(t.resumeKeywordsMatched) || 0,
      expectedSalary:       parseInt(t.expectedSalary)        || 0,
      locationPreference:   t.locationPreference              || "Remote",
      referralEmployeeId:   t.referralEmployeeId,
      timeToHireDays:       parseInt(t.timeToHireDays)        || undefined,
      rejectionReason:      t.rejectionReason,
    };
  });

  await JobApplication.deleteMany({});
  const result = await JobApplication.insertMany(docs, { ordered: false }).catch(e => {
    if (e.code === 11000) return { insertedCount: e.result?.nInserted || docs.length };
    throw e;
  });
  console.log(`✅ Applications seeded: ${result.insertedCount ?? docs.length}`);
}

// ── 4. Performance Reviews ────────────────────────────────────────────────────
async function seedReviews() {
  const rows = parseCSV(path.join(DATA_DIR, "performance_reviews.csv"));

  // ── KEY FIX: deduplicate on (employeeId + reviewPeriod) before inserting ──
  const seen = new Set();
  const unique = [];
  for (const r of rows) {
    const t   = transformKeys(r);
    const key = `${t.employeeId}__${t.reviewPeriod}`;
    if (seen.has(key)) continue;   // skip duplicate combinations
    seen.add(key);
    unique.push(t);
  }

  const docs = unique.map((t, idx) => ({
    // Give every review a guaranteed-unique reviewId even if the CSV had dupes
    reviewId:             t.reviewId || `REV${String(idx + 1).padStart(5, "0")}`,
    employeeId:           t.employeeId,
    reviewPeriod:         t.reviewPeriod,
    reviewerId:           t.reviewerId || "EMP01001",
    overallRating:        parseInt(t.overallRating)               || 3,
    goalsAchievedPct:     parseInt(t.goalsAchievedPct)            || 80,
    communicationScore:   parseInt(t.communicationScore)          || 5,
    technicalScore:       parseInt(t.technicalScore)              || 5,
    leadershipScore:      parseInt(t.leadershipScore)             || 5,
    collaborationScore:   parseInt(t.collaborationScore)          || 5,
    innovationScore:      parseInt(t.innovationScore)             || 5,
    strengths:            t.strengths,
    areasForImprovement:  t.areasForImprovement,
    promotionRecommended: t.promotionRecommended                  || "No",
    salaryIncreaseRecommendedPct: parseInt(t.salaryIncreaseRecommendedPct) || 0,
    aiSentimentScore:     parseFloat(t.aiSentimentScore)          || 5,
    reviewDate:           new Date(t.reviewDate),
    status:               "Submitted",
  }));

  await PerformanceReview.deleteMany({});

  // Drop the unique compound index temporarily to avoid conflicts,
  // then re-insert with ordered:false as extra safety
  try {
    await PerformanceReview.collection.dropIndex("employeeId_1_reviewPeriod_1");
  } catch (_) {
    // Index may not exist — that's fine
  }

  const result = await PerformanceReview.insertMany(docs, { ordered: false }).catch(e => {
    if (e.code === 11000) {
      const inserted = e.result?.nInserted ?? (docs.length - (e.writeErrors?.length || 0));
      console.log(`   ⚠️  ${e.writeErrors?.length || 0} duplicate reviews skipped`);
      return { insertedCount: inserted };
    }
    throw e;
  });
  console.log(`✅ Reviews seeded: ${result.insertedCount ?? docs.length}`);
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function seed() {
  try {
    const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/talentiq";
    await mongoose.connect(uri);
    console.log("🔗 Connected to MongoDB\n");

    await seedUsers();
    await seedEmployees();
    await seedApplications();
    await seedReviews();

    console.log("\n🎉 Database seeded successfully! All data is ready.");
    console.log("   Now run: npm run dev   (to start the backend server)");
    process.exit(0);
  } catch (err) {
    console.error("\n❌ Seed failed:", err.message);
    console.error("   Full error:", err);
    process.exit(1);
  }
}

seed();
