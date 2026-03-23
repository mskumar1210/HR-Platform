const mongoose = require("mongoose");

const jobApplicationSchema = new mongoose.Schema({
  applicationId:       { type: String, required: true, unique: true, index: true },
  candidateName:       { type: String, required: true },
  email:               { type: String, required: true, lowercase: true },
  jobTitle:            { type: String, required: true },
  department:          { type: String, required: true, index: true },
  appliedDate:         { type: Date, default: Date.now },
  source:              { type: String },
  status: {
    type: String,
    enum: ["Applied","Screening","Phone Interview","Technical Interview","Offer Extended","Hired","Rejected","Withdrawn"],
    default: "Applied",
    index: true,
  },
  yearsExperience:     { type: Number, min: 0 },
  educationLevel:      { type: String },
  skillsMatchScore:    { type: Number, min: 0, max: 100 },
  aiCompatibilityScore:{ type: Number, min: 0, max: 100 },
  interviewScore:      { type: Number, min: 1, max: 10 },
  resumeKeywordsMatched: { type: Number },
  expectedSalary:      { type: Number },
  locationPreference:  { type: String, enum: ["Remote","Hybrid","On-site"] },
  referralEmployeeId:  { type: String },
  timeToHireDays:      { type: Number },
  rejectionReason:     { type: String },
  resumeUrl:           { type: String },
  coverLetterUrl:      { type: String },
  notes:               [{ author: String, content: String, date: Date }],
  interviewSchedule:   [{
    round:     { type: Number },
    date:      { type: Date },
    interviewers: [String],
    feedback:  { type: String },
    score:     { type: Number },
  }],
  aiSummary:           { type: String },
  aiRecommendation:    { type: String, enum: ["Strong Hire","Hire","Maybe","No Hire"] },
}, { timestamps: true });

jobApplicationSchema.index({ department: 1, status: 1 });
jobApplicationSchema.index({ appliedDate: -1 });
jobApplicationSchema.index({ aiCompatibilityScore: -1 });
jobApplicationSchema.index({ candidateName: "text", email: "text", jobTitle: "text" });

module.exports = mongoose.model("JobApplication", jobApplicationSchema);
