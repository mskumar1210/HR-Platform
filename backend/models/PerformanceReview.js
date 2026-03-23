const mongoose = require("mongoose");

const performanceReviewSchema = new mongoose.Schema({
  reviewId:          { type: String, required: true, unique: true },
  employeeId:        { type: String, required: true, index: true },
  reviewPeriod:      { type: String, required: true },
  reviewerId:        { type: String, required: true },
  overallRating:     { type: Number, min: 1, max: 5, required: true },
  goalsAchievedPct:  { type: Number, min: 0, max: 150 },
  communicationScore:{ type: Number, min: 1, max: 10 },
  technicalScore:    { type: Number, min: 1, max: 10 },
  leadershipScore:   { type: Number, min: 1, max: 10 },
  collaborationScore:{ type: Number, min: 1, max: 10 },
  innovationScore:   { type: Number, min: 1, max: 10 },
  strengths:         { type: String },
  areasForImprovement: { type: String },
  promotionRecommended: { type: String, enum: ["Yes","No"] },
  salaryIncreaseRecommendedPct: { type: Number, min: 0, max: 50 },
  aiSentimentScore:  { type: Number, min: 0, max: 10 },
  aiSummary:         { type: String },
  reviewDate:        { type: Date },
  status:            { type: String, enum: ["Draft","Submitted","Approved","Acknowledged"], default: "Draft" },
  employeeComments:  { type: String },
}, { timestamps: true });

performanceReviewSchema.index({ employeeId: 1, reviewPeriod: 1 }, { unique: true });

module.exports = mongoose.model("PerformanceReview", performanceReviewSchema);
