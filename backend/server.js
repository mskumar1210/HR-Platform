// ─── TalentIQ Backend Server ──────────────────────────────────────────────────
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const path = require("path");
require("dotenv").config();

const logger = require("./utils/logger");
const { errorHandler, notFound } = require("./middleware/errorMiddleware");

// ─── Route imports ────────────────────────────────────────────────────────────
const authRoutes         = require("./routes/auth");
const employeeRoutes     = require("./routes/employees");
const applicationRoutes  = require("./routes/applications");
const performanceRoutes  = require("./routes/performance");
const trainingRoutes     = require("./routes/training");
const payrollRoutes      = require("./routes/payroll");
const analyticsRoutes    = require("./routes/analytics");
const aiRoutes           = require("./routes/ai");
const dashboardRoutes    = require("./routes/dashboard");
const reportRoutes       = require("./routes/reports");

const app = express();

// ─── Security & Middleware ────────────────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
    },
  },
}));

app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(compression());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// HTTP request logging
app.use(morgan("combined", {
  stream: { write: (msg) => logger.info(msg.trim()) },
  skip: (req) => req.url === "/health",
}));

// Global rate limiter
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later." },
});
app.use("/api/", limiter);

// Stricter limiter for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: "Too many auth attempts, please try again in 15 minutes." },
});

// Static uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    version: "1.0.0",
    database: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  });
});

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use("/api/auth",         authLimiter, authRoutes);
app.use("/api/employees",    employeeRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/performance",  performanceRoutes);
app.use("/api/training",     trainingRoutes);
app.use("/api/payroll",      payrollRoutes);
app.use("/api/analytics",    analyticsRoutes);
app.use("/api/ai",           aiRoutes);
app.use("/api/dashboard",    dashboardRoutes);
app.use("/api/reports",      reportRoutes);

// ─── Error handlers ───────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ─── Database Connection & Server Start ───────────────────────────────────────
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/talentiq", {
      serverSelectionTimeoutMS: 5000,
    });
    logger.info("✅ MongoDB connected successfully");

    const server = app.listen(PORT, () => {
      logger.info(`🚀 TalentIQ Server running on port ${PORT} [${process.env.NODE_ENV}]`);
    });

    // Graceful shutdown
    process.on("SIGTERM", () => {
      logger.info("SIGTERM received – shutting down gracefully");
      server.close(() => {
        mongoose.connection.close();
        logger.info("Server closed");
        process.exit(0);
      });
    });

  } catch (err) {
    logger.error("❌ Failed to connect to MongoDB:", err.message);
    process.exit(1);
  }
};

startServer();

module.exports = app;
