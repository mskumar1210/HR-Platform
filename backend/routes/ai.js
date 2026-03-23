const express = require("express");
const { body, validationResult } = require("express-validator");
const { protect, authorize } = require("../middleware/authMiddleware");
const Employee = require("../models/Employee");
const JobApplication = require("../models/JobApplication");
const PerformanceReview = require("../models/PerformanceReview");
const logger = require("../utils/logger");

const router = express.Router();
router.use(protect);

// ─── Shared: call OpenAI API (or mock if no key) ──────────────────────────────
async function callAI(messages, maxTokens = 1024) {
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.startsWith("sk-your")) {
    // Return smart mock response when no real API key configured
    return generateMockAIResponse(messages);
  }
  const OpenAI = require("openai");
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const response = await openai.chat.completions.create({
    model: process.env.AI_MODEL || "gpt-4o-mini",
    messages,
    max_tokens: maxTokens,
    temperature: 0.7,
  });
  return response.choices[0].message.content;
}

function generateMockAIResponse(messages) {
  const lastMsg = messages[messages.length - 1].content.toLowerCase();
  if (lastMsg.includes("attrition") || lastMsg.includes("risk")) {
    return JSON.stringify({
      riskLevel: "Medium",
      score: 0.58,
      keyFactors: ["Low satisfaction score (4.2/10)", "No promotion in 3 years", "Frequent overtime"],
      recommendations: [
        "Schedule a 1:1 career development discussion within 2 weeks",
        "Review compensation benchmarks for this role",
        "Offer flexible work arrangements to reduce burnout"
      ],
      timeline: "Risk materializes in 3-6 months if unaddressed"
    });
  }
  if (lastMsg.includes("resume") || lastMsg.includes("candidate") || lastMsg.includes("application")) {
    return JSON.stringify({
      overallScore: 78,
      recommendation: "Hire",
      strengths: ["Strong technical background", "Relevant industry experience", "Good communication skills"],
      concerns: ["Gap in leadership experience", "Salary expectations slightly above budget"],
      cultureFitScore: 82,
      technicalFitScore: 75,
      suggestedInterviewQuestions: [
        "Describe a time you led a cross-functional project under tight deadlines.",
        "Walk me through your approach to learning a new technology stack quickly."
      ]
    });
  }
  if (lastMsg.includes("performance") || lastMsg.includes("review")) {
    return JSON.stringify({
      sentiment: "Positive",
      sentimentScore: 7.8,
      keyThemes: ["Strong technical delivery", "Team collaboration", "Growth mindset"],
      promotionReadiness: "Ready in 6-12 months",
      developmentPlan: [
        "Expand stakeholder management skills via cross-team projects",
        "Take on 1 mentorship responsibility in Q3",
        "Complete AWS Solutions Architect certification"
      ],
      retentionRisk: "Low"
    });
  }
  if (lastMsg.includes("salary") || lastMsg.includes("compensation")) {
    return JSON.stringify({
      marketRange: { p25: 95000, p50: 115000, p75: 140000, p90: 165000 },
      recommendation: "The current salary is 8% below market median for this role and location.",
      adjustment: "Consider a 5-10% increase to remain competitive",
      benchmarks: ["Glassdoor median: $118,000", "LinkedIn insights: $112,000-$128,000"]
    });
  }
  return JSON.stringify({
    response: "AI analysis complete. All metrics are within normal parameters. No immediate action required.",
    confidence: 0.85,
    generatedAt: new Date().toISOString()
  });
}

// ─── POST /api/ai/attrition-risk ─────────────────────────────────────────────
router.post("/attrition-risk", [body("employeeId").notEmpty()], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const employee = await Employee.findOne({ employeeId: req.body.employeeId });
    if (!employee) return res.status(404).json({ error: "Employee not found" });

    const prompt = `Analyze attrition risk for this employee profile and return JSON:
Employee: ${employee.fullName || employee.firstName + " " + employee.lastName}
Department: ${employee.department}, Role: ${employee.role}
Tenure: ${employee.tenureMonths} months, Salary: $${employee.salary}
Satisfaction Score: ${employee.satisfactionScore}/10
Performance: ${employee.performanceRating}
Promotions: ${employee.promotionsCount}, Last training hours: ${employee.trainingHoursYtd}
Remote work: ${employee.remoteWork}, Overtime (monthly): ${employee.overtimeHoursMonthly}h

Return JSON with: riskLevel (Low/Medium/High/Critical), score (0-1), keyFactors (array), recommendations (array), timeline.`;

    const aiResult = await callAI([
      { role: "system", content: "You are an expert HR analytics AI. Always respond in valid JSON format." },
      { role: "user", content: prompt }
    ]);

    let parsed;
    try { parsed = JSON.parse(aiResult); } catch { parsed = { raw: aiResult }; }

    // Update employee record
    await Employee.findByIdAndUpdate(employee._id, {
      attritionRisk: parsed.score || 0.5,
      aiInsights: JSON.stringify(parsed),
    });

    logger.info(`AI attrition analysis for ${req.body.employeeId}`);
    res.json({ employeeId: req.body.employeeId, analysis: parsed });
  } catch (err) {
    logger.error("AI attrition error:", err);
    res.status(500).json({ error: "AI analysis failed" });
  }
});

// ─── POST /api/ai/screen-resume ───────────────────────────────────────────────
router.post("/screen-resume", authorize("super_admin","hr_manager","recruiter"), [
  body("applicationId").notEmpty(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const application = await JobApplication.findOne({ applicationId: req.body.applicationId });
    if (!application) return res.status(404).json({ error: "Application not found" });

    const prompt = `Screen this job application and return detailed JSON analysis:
Candidate: ${application.candidateName}
Position: ${application.jobTitle} (${application.department})
Experience: ${application.yearsExperience} years
Education: ${application.educationLevel}
Skills Match Score: ${application.skillsMatchScore}%
Expected Salary: $${application.expectedSalary}
Source: ${application.source}
Location Preference: ${application.locationPreference}
Keywords Matched: ${application.resumeKeywordsMatched}

Return JSON with: overallScore (0-100), recommendation (Strong Hire/Hire/Maybe/No Hire), strengths (array), concerns (array), cultureFitScore, technicalFitScore, suggestedInterviewQuestions (array).`;

    const aiResult = await callAI([
      { role: "system", content: "You are an expert talent acquisition AI. Respond in valid JSON." },
      { role: "user", content: prompt }
    ]);

    let parsed;
    try { parsed = JSON.parse(aiResult); } catch { parsed = { raw: aiResult }; }

    await JobApplication.findByIdAndUpdate(application._id, {
      aiCompatibilityScore: parsed.overallScore || application.aiCompatibilityScore,
      aiSummary: JSON.stringify(parsed),
      aiRecommendation: parsed.recommendation || "Maybe",
    });

    res.json({ applicationId: req.body.applicationId, screening: parsed });
  } catch (err) {
    logger.error("AI resume screen error:", err);
    res.status(500).json({ error: "Resume screening failed" });
  }
});

// ─── POST /api/ai/analyze-review ─────────────────────────────────────────────
router.post("/analyze-review", [body("reviewId").notEmpty()], async (req, res) => {
  try {
    const review = await PerformanceReview.findOne({ reviewId: req.body.reviewId });
    if (!review) return res.status(404).json({ error: "Review not found" });

    const prompt = `Analyze this performance review and return JSON:
Period: ${review.reviewPeriod}
Overall Rating: ${review.overallRating}/5
Goals Achieved: ${review.goalsAchievedPct}%
Scores — Communication:${review.communicationScore}, Technical:${review.technicalScore}, Leadership:${review.leadershipScore}, Collaboration:${review.collaborationScore}, Innovation:${review.innovationScore}
Strengths: ${review.strengths}
Improvement Areas: ${review.areasForImprovement}
Promotion Recommended: ${review.promotionRecommended}

Return JSON with: sentiment (Positive/Neutral/Negative), sentimentScore (0-10), keyThemes (array), promotionReadiness, developmentPlan (array), retentionRisk (Low/Medium/High).`;

    const aiResult = await callAI([
      { role: "system", content: "You are an HR performance analytics expert. Respond in valid JSON." },
      { role: "user", content: prompt }
    ]);

    let parsed;
    try { parsed = JSON.parse(aiResult); } catch { parsed = { raw: aiResult }; }

    await PerformanceReview.findByIdAndUpdate(review._id, {
      aiSentimentScore: parsed.sentimentScore || review.aiSentimentScore,
      aiSummary: JSON.stringify(parsed),
    });

    res.json({ reviewId: req.body.reviewId, analysis: parsed });
  } catch (err) {
    res.status(500).json({ error: "Review analysis failed" });
  }
});

// ─── POST /api/ai/salary-benchmark ───────────────────────────────────────────
router.post("/salary-benchmark", [
  body("role").notEmpty(),
  body("department").notEmpty(),
  body("currentSalary").isNumeric(),
  body("yearsExperience").isNumeric(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const { role, department, currentSalary, yearsExperience, city } = req.body;

    const prompt = `Provide salary benchmarking analysis for this role and return JSON:
Role: ${role}, Department: ${department}
Current Salary: $${currentSalary}
Experience: ${yearsExperience} years
Location: ${city || "US (Remote)"}

Return JSON with: marketRange (p25, p50, p75, p90), recommendation, adjustment, benchmarks (array), competitivePosition (Below/At/Above Market).`;

    const aiResult = await callAI([
      { role: "system", content: "You are a compensation analytics expert. Respond in valid JSON." },
      { role: "user", content: prompt }
    ]);

    let parsed;
    try { parsed = JSON.parse(aiResult); } catch { parsed = { raw: aiResult }; }
    res.json({ benchmark: parsed });
  } catch (err) {
    res.status(500).json({ error: "Salary benchmark failed" });
  }
});

// ─── POST /api/ai/ask ─────────────────────────────────────────────────────────
router.post("/ask", [body("question").trim().notEmpty()], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const { question, context } = req.body;

    // Fetch relevant stats for context
    const [empCount, deptStats] = await Promise.all([
      Employee.countDocuments({ employmentStatus: "Active" }),
      Employee.aggregate([{ $match: { employmentStatus: "Active" } }, { $group: { _id: "$department", count: { $sum: 1 } } }]),
    ]);

    const systemPrompt = `You are TalentIQ, an AI-powered HR assistant. You have access to company HR data.
Current stats: ${empCount} active employees across ${deptStats.length} departments.
Top departments: ${deptStats.slice(0, 5).map(d => `${d._id}: ${d.count}`).join(", ")}.
Answer HR questions helpfully, concisely, and professionally. If asked for data analysis, provide insights.
Additional context: ${context || "None"}`;

    const aiResult = await callAI([
      { role: "system", content: systemPrompt },
      { role: "user", content: question }
    ], 1500);

    res.json({ answer: aiResult, timestamp: new Date().toISOString() });
  } catch (err) {
    res.status(500).json({ error: "AI assistant unavailable" });
  }
});

// ─── POST /api/ai/skill-gap ───────────────────────────────────────────────────
router.post("/skill-gap", [body("employeeId").notEmpty(), body("targetRole").notEmpty()], async (req, res) => {
  try {
    const employee = await Employee.findOne({ employeeId: req.body.employeeId });
    if (!employee) return res.status(404).json({ error: "Employee not found" });

    const prompt = `Analyze skill gap for career progression:
Current Role: ${employee.role} in ${employee.department}
Current Skills: ${employee.skills?.join(", ")}
Target Role: ${req.body.targetRole}
Years Experience: ${employee.yearsExperience}
Performance: ${employee.performanceRating}

Return JSON with: gapScore (0-100, 0=no gap), missingSkills (array), strengthsToLeverage (array), learningPath (array of steps), estimatedTimeMonths.`;

    const aiResult = await callAI([
      { role: "system", content: "You are a career development AI coach. Respond in valid JSON." },
      { role: "user", content: prompt }
    ]);

    let parsed;
    try { parsed = JSON.parse(aiResult); } catch { parsed = { raw: aiResult }; }
    res.json({ employeeId: req.body.employeeId, targetRole: req.body.targetRole, skillGap: parsed });
  } catch (err) {
    res.status(500).json({ error: "Skill gap analysis failed" });
  }
});

// ─── GET /api/ai/bulk-attrition ───────────────────────────────────────────────
router.get("/bulk-attrition", authorize("super_admin","hr_manager","analyst"), async (req, res) => {
  try {
    // Rule-based attrition scoring (fallback when no AI key)
    const employees = await Employee.find({ employmentStatus: "Active" }).select(
      "employeeId firstName lastName department role satisfactionScore tenureMonths promotionsCount overtimeHoursMonthly performanceRating salary"
    ).lean();

    const scored = employees.map((e) => {
      let risk = 0;
      if (e.satisfactionScore < 4)  risk += 0.3;
      else if (e.satisfactionScore < 6) risk += 0.15;
      if (e.promotionsCount === 0 && e.tenureMonths > 24) risk += 0.2;
      if (e.overtimeHoursMonthly > 25) risk += 0.15;
      if (e.performanceRating === "Needs Improvement") risk += 0.1;
      if (e.performanceRating === "Below Expectations") risk += 0.2;
      risk = Math.min(risk + Math.random() * 0.1, 1);

      return {
        employeeId: e.employeeId,
        name: `${e.firstName} ${e.lastName}`,
        department: e.department,
        role: e.role,
        riskScore: parseFloat(risk.toFixed(3)),
        riskLevel: risk >= 0.7 ? "Critical" : risk >= 0.5 ? "High" : risk >= 0.3 ? "Medium" : "Low",
      };
    });

    // Sort by risk descending
    scored.sort((a, b) => b.riskScore - a.riskScore);

    const summary = {
      critical: scored.filter(e => e.riskLevel === "Critical").length,
      high:     scored.filter(e => e.riskLevel === "High").length,
      medium:   scored.filter(e => e.riskLevel === "Medium").length,
      low:      scored.filter(e => e.riskLevel === "Low").length,
    };

    res.json({ summary, employees: scored.slice(0, 100) });
  } catch (err) {
    res.status(500).json({ error: "Bulk attrition analysis failed" });
  }
});

module.exports = router;
