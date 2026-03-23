const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema({
  employeeId:        { type: String, required: true, unique: true, index: true },
  firstName:         { type: String, required: true, trim: true },
  lastName:          { type: String, required: true, trim: true },
  email:             { type: String, required: true, unique: true, lowercase: true },
  department:        { type: String, required: true, index: true },
  role:              { type: String, required: true },
  hireDate:          { type: Date, required: true },
  salary:            { type: Number, required: true, min: 0 },
  city:              { type: String },
  state:             { type: String },
  educationLevel:    { type: String, enum: ["High School","Associate's","Bachelor's","Master's","PhD","MBA","JD"] },
  university:        { type: String },
  yearsExperience:   { type: Number, min: 0 },
  skills:            [{ type: String }],
  performanceRating: { type: String, enum: ["Outstanding","Exceeds Expectations","Meets Expectations","Needs Improvement","Below Expectations"] },
  employmentStatus:  { type: String, enum: ["Active","Terminated","On Leave","Probation"], default: "Active", index: true },
  managerId:         { type: String, ref: "Employee" },
  remoteWork:        { type: String, enum: ["Yes","No","Hybrid"] },
  satisfactionScore: { type: Number, min: 1, max: 10 },
  tenureMonths:      { type: Number, min: 0 },
  promotionsCount:   { type: Number, default: 0 },
  trainingHoursYtd:  { type: Number, default: 0 },
  overtimeHoursMonthly: { type: Number, default: 0 },
  attritionRisk:     { type: Number, min: 0, max: 1, default: 0 },
  aiInsights:        { type: String },
  profilePicture:    { type: String },
  phone:             { type: String },
  address:           { type: String },
  emergencyContact:  {
    name:  { type: String },
    phone: { type: String },
    relation: { type: String },
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Virtual: full name
employeeSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual: years at company
employeeSchema.virtual("yearsAtCompany").get(function () {
  return Math.floor((Date.now() - this.hireDate) / (1000 * 60 * 60 * 24 * 365));
});

// Indexes for common queries
employeeSchema.index({ department: 1, employmentStatus: 1 });
employeeSchema.index({ salary: 1 });
employeeSchema.index({ attritionRisk: -1 });
employeeSchema.index({ firstName: "text", lastName: "text", email: "text", role: "text" });

module.exports = mongoose.model("Employee", employeeSchema);
