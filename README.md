# 🚀 TalentIQ — AI-Powered HR & Talent Intelligence Platform

> A **company-level, production-grade full-stack application** featuring AI-driven attrition prediction, intelligent candidate screening, real-time workforce analytics, and a conversational AI HR assistant.

---

## 🌟 Overview

TalentIQ is an enterprise HR Intelligence platform that combines traditional HR management with cutting-edge AI. It solves the #1 challenge for modern HR teams: **turning workforce data into actionable intelligence**.

**Trending Topic**: AI in Human Resources — one of the fastest-growing enterprise software segments, projected to reach $17.6B by 2027.

---

## ✨ Key Features

### 🤖 AI-Powered (OpenAI GPT Integration)
- **Attrition Prediction** — Risk score for every employee with actionable recommendations
- **Resume Screening** — AI compatibility scoring with Strong Hire / No Hire verdict
- **Performance Analysis** — Sentiment scoring + personalized development roadmap
- **Salary Benchmarking** — Market percentile analysis (P25/P50/P75/P90)
- **Skill Gap Analysis** — Career path planning with learning steps
- **AI HR Assistant** — Conversational AI with live workforce context
- **Bulk Attrition Scan** — Score entire active workforce instantly

### 📊 Core HR Modules
- Employee Management (1,200+ records, search, filter, pagination)
- Recruitment Pipeline ATS (1,500+ applications with AI scoring)
- Performance Reviews (1,000+ reviews with AI sentiment)
- Training & L&D tracking (800 records with AI recommendations)
- Payroll & Compensation analytics (1,000 payroll records)
- Real-time Workforce Analytics & Reports

### 🔐 Security
- JWT + Refresh Token authentication
- Role-Based Access Control (6 roles: super_admin, hr_manager, recruiter, manager, analyst, employee)
- Rate limiting, Helmet.js, CORS, input validation

---

## 🛠 Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | React 18, React Router 6, TanStack Query, Recharts, Zustand, Axios |
| **Backend** | Node.js, Express.js, MongoDB/Mongoose, JWT, bcryptjs |
| **AI/ML** | OpenAI GPT-4o-mini (with smart mock fallback) |
| **Security** | Helmet, express-rate-limit, express-validator, CORS |
| **Logging** | Winston (file + console) |
| **Data** | 6 CSV datasets, 6,100+ rows, Python-generated |

---

## 📦 Dataset (6,100+ Rows Total)

| File | Rows | Description |
|------|------|-------------|
| `employees.csv` | 1,200 | Full profiles, skills, performance, attrition risk |
| `job_applications.csv` | 1,500 | Full recruitment pipeline with AI scoring |
| `performance_reviews.csv` | 1,000 | Multi-dimensional reviews + AI sentiment |
| `training_records.csv` | 800 | L&D completions, AI-recommended courses |
| `attrition_data.csv` | 600 | Labeled dataset for ML training |
| `payroll_data.csv` | 1,000 | Monthly compensation breakdown |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- OpenAI API key (optional — smart mock works without it)

### 1. Clone / Extract
```bash
cd talentiq
```

### 2. Install Dependencies
```bash
# Backend
cd backend && npm install

# Frontend
cd ../frontend && npm install
```

### 3. Configure Environment
```bash
cd backend
cp .env.example .env
# Edit .env — set MONGODB_URI and optionally OPENAI_API_KEY
```

### 4. Seed the Database
```bash
cd backend
npm run seed
```

This imports all 6,100+ CSV rows into MongoDB and creates 5 demo users.

### 5. Start the App
```bash
# Terminal 1 — Backend (port 5000)
cd backend && npm run dev

# Terminal 2 — Frontend (port 3000)
cd frontend && npm start
```

Open **http://localhost:3000**

---

## 🔑 Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Super Admin | admin@talentiq.com | Admin@1234 |
| HR Manager | hr@talentiq.com | Admin@1234 |
| Recruiter | recruiter@talentiq.com | Admin@1234 |
| Manager | manager@talentiq.com | Admin@1234 |
| Analyst | analyst@talentiq.com | Admin@1234 |

---

## 📡 API Reference

### Auth
```
POST /api/auth/register     Register new user
POST /api/auth/login        Login → returns JWT
POST /api/auth/refresh      Refresh access token
POST /api/auth/logout       Invalidate session
GET  /api/auth/me           Get current user
```

### Employees
```
GET    /api/employees           List (pagination, search, filter)
GET    /api/employees/stats     Aggregate stats
GET    /api/employees/:id       Get by ID or employeeId
POST   /api/employees           Create employee
PATCH  /api/employees/:id       Update employee
DELETE /api/employees/:id       Delete (super_admin only)
```

### AI Endpoints
```
POST /api/ai/attrition-risk     AI attrition analysis for 1 employee
POST /api/ai/screen-resume      AI resume screening
POST /api/ai/analyze-review     AI performance review analysis
POST /api/ai/salary-benchmark   Market salary benchmarking
POST /api/ai/skill-gap          Skill gap + career path analysis
POST /api/ai/ask                Conversational AI HR assistant
GET  /api/ai/bulk-attrition     Score all active employees
```

### Analytics
```
GET /api/analytics/overview               KPI overview
GET /api/analytics/headcount-trend        12-month headcount
GET /api/analytics/salary-distribution    Salary buckets
GET /api/analytics/department-performance Dept breakdown
GET /api/analytics/hiring-funnel          Recruitment funnel
GET /api/analytics/skills-gap            Top skills
```

---

## 🏗 Project Structure

```
talentiq/
├── data/                          # 6 CSV datasets (6,100+ rows)
│   ├── employees.csv              # 1,200 employee records
│   ├── job_applications.csv       # 1,500 applications
│   ├── performance_reviews.csv    # 1,000 reviews
│   ├── training_records.csv       # 800 training records
│   ├── attrition_data.csv         # 600 attrition records
│   └── payroll_data.csv           # 1,000 payroll records
│
├── backend/
│   ├── server.js                  # Express app entry point
│   ├── .env.example               # Environment template
│   ├── models/
│   │   ├── Employee.js            # Employee schema
│   │   ├── User.js                # Auth user schema
│   │   ├── JobApplication.js      # Application schema
│   │   └── PerformanceReview.js   # Review schema
│   ├── routes/
│   │   ├── auth.js                # JWT auth routes
│   │   ├── employees.js           # Employee CRUD
│   │   ├── applications.js        # Recruitment routes
│   │   ├── performance.js         # Review routes
│   │   ├── training.js            # Training routes
│   │   ├── payroll.js             # Payroll routes
│   │   ├── analytics.js           # Analytics aggregations
│   │   ├── ai.js                  # All AI endpoints
│   │   ├── dashboard.js           # KPI dashboard
│   │   └── reports.js             # Report generation
│   ├── middleware/
│   │   ├── authMiddleware.js      # JWT protect + authorize
│   │   └── errorMiddleware.js     # Global error handler
│   └── utils/
│       ├── logger.js              # Winston logger
│       └── seedDatabase.js        # CSV → MongoDB seeder
│
├── frontend/
│   ├── public/index.html
│   └── src/
│       ├── App.jsx                # Routes + providers
│       ├── index.js               # Entry point
│       ├── index.css              # Design system (CSS variables)
│       ├── components/
│       │   └── Layout.jsx         # Sidebar + top bar
│       ├── pages/
│       │   ├── LoginPage.jsx      # Auth with demo accounts
│       │   ├── DashboardPage.jsx  # KPI + charts overview
│       │   ├── EmployeesPage.jsx  # Employee list + search
│       │   ├── EmployeeDetailPage.jsx
│       │   ├── RecruitmentPage.jsx
│       │   ├── PerformancePage.jsx
│       │   ├── AnalyticsPage.jsx
│       │   ├── AIAssistantPage.jsx # Conversational AI
│       │   ├── AttritionPage.jsx  # Risk dashboard
│       │   ├── TrainingPage.jsx
│       │   ├── PayrollPage.jsx
│       │   ├── ReportsPage.jsx
│       │   └── SettingsPage.jsx
│       ├── hooks/
│       │   └── useAuthStore.js    # Zustand auth state
│       └── utils/
│           └── api.js             # Axios + all API methods
│
├── package.json                   # Root workspace
└── README.md                      # This file
```

---

## 🤖 AI Without an API Key

All AI endpoints work **without an OpenAI API key** using intelligent mock responses. The mock returns realistic JSON with:
- Risk scores and levels
- Bullet-point recommendations
- Hire/No-hire verdicts
- Salary market data

To enable real AI, set `OPENAI_API_KEY` in `backend/.env`.

---

## 📈 Extending the Project

### Add More AI Features
- Resume PDF parsing (integrate `pdf-parse`)
- Interview scheduling with Google Calendar API
- Slack/Teams notifications for high-risk employees

### Add ML Model
The `attrition_data.csv` (600 rows, labeled) is ready for training a scikit-learn / XGBoost model:
```python
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
df = pd.read_csv('data/attrition_data.csv')
# Target: left_company (Yes/No)
```

### Deploy
- **Backend**: Railway, Render, or AWS EC2
- **Frontend**: Vercel or Netlify
- **Database**: MongoDB Atlas (free tier works)

---

## 📄 License

MIT License — Free for commercial and personal use.

---

*Built as a company-level full-stack AI project showcasing enterprise HR intelligence.*
