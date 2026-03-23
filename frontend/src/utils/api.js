import axios from "axios";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";

const api = axios.create({
  baseURL: `${API_BASE}/api`,
  timeout: 30000,
  headers: { "Content-Type": "application/json" },
});

// ─── Request interceptor: attach token ───────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response interceptor: handle 401 + token refresh ────────────────────────
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => error ? prom.reject(error) : prom.resolve(token));
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }
      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) throw new Error("No refresh token");
        const { data } = await axios.post(`${API_BASE}/api/auth/refresh`, { refreshToken });
        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("refreshToken", data.refreshToken);
        processQueue(null, data.accessToken);
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(originalRequest);
      } catch (err) {
        processQueue(err, null);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        window.location.href = "/login";
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

// ─── API service methods ──────────────────────────────────────────────────────
export const authAPI = {
  login:         (data)   => api.post("/auth/login", data),
  register:      (data)   => api.post("/auth/register", data),
  logout:        ()       => api.post("/auth/logout"),
  refresh:       (data)   => api.post("/auth/refresh", data),
  me:            ()       => api.get("/auth/me"),
  updateProfile: (data)   => api.patch("/auth/update-profile", data),
};

export const employeesAPI = {
  list:   (params) => api.get("/employees", { params }),
  get:    (id)     => api.get(`/employees/${id}`),
  create: (data)   => api.post("/employees", data),
  update: (id, data) => api.patch(`/employees/${id}`, data),
  delete: (id)     => api.delete(`/employees/${id}`),
  stats:  ()       => api.get("/employees/stats"),
};

export const applicationsAPI = {
  list:   (params) => api.get("/applications", { params }),
  get:    (id)     => api.get(`/applications/${id}`),
  create: (data)   => api.post("/applications", data),
  update: (id, data) => api.patch(`/applications/${id}`, data),
  delete: (id)     => api.delete(`/applications/${id}`),
};

export const performanceAPI = {
  list:   (params) => api.get("/performance", { params }),
  get:    (id)     => api.get(`/performance/${id}`),
  create: (data)   => api.post("/performance", data),
  update: (id, data) => api.patch(`/performance/${id}`, data),
};

export const analyticsAPI = {
  overview:              () => api.get("/analytics/overview"),
  headcountTrend:        () => api.get("/analytics/headcount-trend"),
  salaryDistribution:    () => api.get("/analytics/salary-distribution"),
  departmentPerformance: () => api.get("/analytics/department-performance"),
  hiringFunnel:          () => api.get("/analytics/hiring-funnel"),
  skillsGap:             () => api.get("/analytics/skills-gap"),
};

export const dashboardAPI = {
  kpis: () => api.get("/dashboard/kpis"),
};

export const aiAPI = {
  attritionRisk:    (data) => api.post("/ai/attrition-risk", data),
  screenResume:     (data) => api.post("/ai/screen-resume", data),
  analyzeReview:    (data) => api.post("/ai/analyze-review", data),
  salaryBenchmark:  (data) => api.post("/ai/salary-benchmark", data),
  ask:              (data) => api.post("/ai/ask", data),
  skillGap:         (data) => api.post("/ai/skill-gap", data),
  bulkAttrition:    ()     => api.get("/ai/bulk-attrition"),
};

export const reportsAPI = {
  list: () => api.get("/reports"),
  get:  (id) => api.get(`/reports/${id}`),
};

export default api;
