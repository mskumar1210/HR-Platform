const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name:         { type: String, required: true, trim: true },
  email:        { type: String, required: true, unique: true, lowercase: true },
  password:     { type: String, required: true, minlength: 8, select: false },
  role:         { type: String, enum: ["super_admin","hr_manager","recruiter","manager","employee","analyst"], default: "employee" },
  department:   { type: String },
  employeeId:   { type: String, ref: "Employee" },
  avatar:       { type: String },
  isActive:     { type: Boolean, default: true },
  lastLogin:    { type: Date },
  refreshToken: { type: String, select: false },
  permissions:  [{ type: String }],
  preferences: {
    theme:        { type: String, default: "light" },
    notifications: { type: Boolean, default: true },
    language:     { type: String, default: "en" },
    dashboardLayout: { type: mongoose.Schema.Types.Mixed },
  },
  passwordResetToken:   { type: String, select: false },
  passwordResetExpires: { type: Date, select: false },
}, { timestamps: true });

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.refreshToken;
  delete obj.passwordResetToken;
  delete obj.passwordResetExpires;
  return obj;
};

module.exports = mongoose.model("User", userSchema);
