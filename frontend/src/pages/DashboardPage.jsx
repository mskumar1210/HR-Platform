import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Users, Briefcase, TrendingUp, AlertTriangle, Activity, DollarSign, Clock, Star } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { dashboardAPI, analyticsAPI } from "../utils/api";

const KPICard = ({ title, value, subtitle, icon: Icon, color = "var(--accent)", trend, loading }) => (
  <div className="kpi-card fade-in">
    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
      <div style={{ width: 42, height: 42, borderRadius: 10, background: `${color}18`, border: `1px solid ${color}30`, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon size={20} color={color} />
      </div>
      {trend !== undefined && (
        <span style={{ fontSize: 12, fontWeight: 600, color: trend >= 0 ? "var(--success)" : "var(--danger)", background: trend >= 0 ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)", padding: "3px 8px", borderRadius: 20 }}>
          {trend >= 0 ? "+" : ""}{trend}%
        </span>
      )}
    </div>
    {loading ? (
      <div>
        <div className="skeleton" style={{ height: 32, width: "60%", marginBottom: 8 }} />
        <div className="skeleton" style={{ height: 14, width: "80%" }} />
      </div>
    ) : (
      <>
        <div style={{ fontSize: 28, fontWeight: 800, fontFamily: "var(--font-display)", color: "var(--text-primary)", lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 6 }}>{title}</div>
        {subtitle && <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 3 }}>{subtitle}</div>}
      </>
    )}
  </div>
);

const CHART_COLORS = ["#3b82f6","#8b5cf6","#10b981","#f59e0b","#ef4444","#14b8a6","#f97316","#ec4899"];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 8, padding: "10px 14px" }}>
      <p style={{ color: "var(--text-secondary)", fontSize: 12, marginBottom: 6 }}>{label}</p>
      {payload.map((p, i) => <p key={i} style={{ color: p.color, fontSize: 13, fontWeight: 600 }}>{p.name}: {p.value?.toLocaleString()}</p>)}
    </div>
  );
};

export default function DashboardPage() {
  const { data: kpis, isLoading: kpiLoading } = useQuery({ queryKey: ["kpis"], queryFn: () => dashboardAPI.kpis().then(r => r.data) });
  const { data: trend } = useQuery({ queryKey: ["headcount-trend"], queryFn: () => analyticsAPI.headcountTrend().then(r => r.data) });
  const { data: deptData } = useQuery({ queryKey: ["dept-perf"], queryFn: () => analyticsAPI.departmentPerformance().then(r => r.data) });
  const { data: funnel } = useQuery({ queryKey: ["hiring-funnel"], queryFn: () => analyticsAPI.hiringFunnel().then(r => r.data) });

  const kpiCards = [
    { key: "activeHeadcount",       title: "Active Employees",      icon: Users,         color: "#3b82f6", trend: 4.2  },
    { key: "openRoles",             title: "Open Requisitions",     icon: Briefcase,     color: "#8b5cf6", trend: -8.1 },
    { key: "avgPerformanceRating",  title: "Avg Performance Rating",icon: Star,          color: "#10b981", suffix: "/5" },
    { key: "attritionRate",         title: "Attrition Rate",        icon: TrendingUp,    color: "#f59e0b", suffix: "%", trend: -1.2 },
    { key: "eNPS",                  title: "Employee NPS",          icon: Activity,      color: "#14b8a6", trend: 5.8  },
    { key: "timeToFill",            title: "Avg Time to Fill (days)",icon: Clock,        color: "#f97316" },
    { key: "trainingCompletionRate",title: "Training Completion",   icon: DollarSign,    color: "#ec4899", suffix: "%" },
    { key: "diversityIndex",        title: "Diversity Index",       icon: AlertTriangle, color: "#06b6d4" },
  ];

  return (
    <div>
      <div className="page-header flex-between">
        <div>
          <h1 className="page-title">HR Command Center</h1>
          <p className="page-subtitle">Real-time workforce intelligence — {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <select className="form-input" style={{ width: "auto", fontSize: 13 }}>
            <option>All Departments</option>
            <option>Engineering</option>
            <option>Product</option>
            <option>Sales</option>
          </select>
          <select className="form-input" style={{ width: "auto", fontSize: 13 }}>
            <option>Last 12 months</option>
            <option>Last 6 months</option>
            <option>This year</option>
          </select>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-4" style={{ marginBottom: 28 }}>
        {kpiCards.map(({ key, title, icon, color, trend, suffix }) => (
          <KPICard key={key} title={title} icon={icon} color={color} trend={trend} loading={kpiLoading}
            value={kpis ? `${kpis[key]?.toLocaleString() || 0}${suffix || ""}` : "—"}
          />
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-2" style={{ marginBottom: 24 }}>
        {/* Headcount Trend */}
        <div className="card">
          <div className="flex-between" style={{ marginBottom: 20 }}>
            <h3>Headcount Trend</h3>
            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Last 12 months</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={trend || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" tick={{ fill: "var(--text-muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "var(--text-muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2.5} dot={{ fill: "#3b82f6", r: 3 }} activeDot={{ r: 5 }} name="Headcount" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Hiring Funnel */}
        <div className="card">
          <div className="flex-between" style={{ marginBottom: 20 }}>
            <h3>Hiring Funnel</h3>
            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Active pipeline</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={funnel || []} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
              <XAxis type="number" tick={{ fill: "var(--text-muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="stage" tick={{ fill: "var(--text-secondary)", fontSize: 11 }} axisLine={false} tickLine={false} width={120} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" name="Candidates" radius={[0,4,4,0]}>
                {(funnel || []).map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-2">
        {/* Dept Headcount */}
        <div className="card">
          <div className="flex-between" style={{ marginBottom: 20 }}>
            <h3>Headcount by Department</h3>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={(deptData || []).slice(0, 8)}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="_id" tick={{ fill: "var(--text-muted)", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "var(--text-muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="headcount" name="Headcount" radius={[4,4,0,0]}>
                {(deptData || []).map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Dept Satisfaction */}
        <div className="card">
          <div className="flex-between" style={{ marginBottom: 20 }}>
            <h3>Satisfaction by Department</h3>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={(deptData || []).slice(0, 8)}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="_id" tick={{ fill: "var(--text-muted)", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 10]} tick={{ fill: "var(--text-muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="avgSatisfaction" name="Avg Satisfaction" radius={[4,4,0,0]} fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
