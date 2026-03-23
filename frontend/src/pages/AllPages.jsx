import React from "react";
import { useQuery } from "@tanstack/react-query";
import { analyticsAPI } from "../utils/api";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, RadarChart, PolarGrid, PolarAngleAxis, Radar } from "recharts";

const COLORS = ["#3b82f6","#8b5cf6","#10b981","#f59e0b","#ef4444","#14b8a6","#f97316","#ec4899","#06b6d4","#84cc16"];
const Tip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 8, padding: "10px 14px" }}><p style={{ color: "var(--text-secondary)", fontSize: 12 }}>{label}</p>{payload.map((p,i) => <p key={i} style={{ color: p.color || "var(--text-primary)", fontSize: 13, fontWeight: 600 }}>{p.name}: {typeof p.value === "number" ? p.value.toLocaleString() : p.value}</p>)}</div>;
};

export function AnalyticsPage() {
  const { data: salDist } = useQuery({ queryKey: ["salary-dist"], queryFn: () => analyticsAPI.salaryDistribution().then(r => r.data) });
  const { data: skills } = useQuery({ queryKey: ["skills-gap"], queryFn: () => analyticsAPI.skillsGap().then(r => r.data) });
  const { data: dept } = useQuery({ queryKey: ["dept-perf"], queryFn: () => analyticsAPI.departmentPerformance().then(r => r.data) });
  return (
    <div>
      <div className="page-header"><h1 className="page-title">Workforce Analytics</h1><p className="page-subtitle">Deep-dive into compensation, skills, and organizational health</p></div>
      <div className="grid grid-2" style={{ marginBottom: 24 }}>
        <div className="card">
          <h3 style={{ marginBottom: 20 }}>Salary Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={salDist || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="range" tick={{ fill: "var(--text-muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "var(--text-muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<Tip />} />
              <Bar dataKey="count" name="Employees" radius={[4,4,0,0]}>{(salDist||[]).map((_,i)=><Cell key={i} fill={COLORS[i%COLORS.length]} />)}</Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <h3 style={{ marginBottom: 20 }}>Top 15 Skills in Organization</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={(skills||[]).slice(0,15)} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
              <XAxis type="number" tick={{ fill: "var(--text-muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="skill" tick={{ fill: "var(--text-secondary)", fontSize: 11 }} axisLine={false} tickLine={false} width={120} />
              <Tooltip content={<Tip />} />
              <Bar dataKey="count" name="Employees" radius={[0,4,4,0]} fill="#8b5cf6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="card">
        <h3 style={{ marginBottom: 20 }}>Average Salary by Department</h3>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={dept||[]}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="_id" tick={{ fill: "var(--text-muted)", fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "var(--text-muted)", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v=>`$${(v/1000).toFixed(0)}k`} />
            <Tooltip content={<Tip />} formatter={v=>[`$${v.toLocaleString()}`, "Avg Salary"]} />
            <Bar dataKey="avgSalary" name="Avg Salary" radius={[4,4,0,0]}>{(dept||[]).map((_,i)=><Cell key={i} fill={COLORS[i%COLORS.length]} />)}</Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function PerformancePage() {
  const { data, isLoading } = useQuery({ queryKey: ["performance"], queryFn: async () => {
    const { performanceAPI } = await import("../utils/api");
    return performanceAPI.list({ limit: 30 }).then(r => r.data);
  }});
  const reviews = data?.reviews || [];
  const ratingMap = { 1:"badge-danger", 2:"badge-warning", 3:"badge-neutral", 4:"badge-info", 5:"badge-success" };
  return (
    <div>
      <div className="page-header"><h1 className="page-title">Performance Management</h1><p className="page-subtitle">Reviews, ratings, and AI-powered sentiment analysis</p></div>
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <table className="data-table">
          <thead><tr><th>Employee ID</th><th>Period</th><th>Overall Rating</th><th>Goals Achieved</th><th>Communication</th><th>Technical</th><th>Leadership</th><th>Promotion</th><th>AI Sentiment</th></tr></thead>
          <tbody>
            {isLoading ? <tr><td colSpan={9} style={{ textAlign:"center", padding:40, color:"var(--text-muted)" }}>Loading...</td></tr>
            : reviews.map(r => (
              <tr key={r._id}>
                <td style={{ fontSize:13 }}>{r.employeeId}</td>
                <td style={{ fontSize:13, color:"var(--text-secondary)" }}>{r.reviewPeriod}</td>
                <td><span className={`badge ${ratingMap[r.overallRating]||"badge-neutral"}`}>{r.overallRating}/5</span></td>
                <td style={{ fontSize:13 }}>{r.goalsAchievedPct}%</td>
                <td style={{ fontSize:13 }}>{r.communicationScore}/10</td>
                <td style={{ fontSize:13 }}>{r.technicalScore}/10</td>
                <td style={{ fontSize:13 }}>{r.leadershipScore}/10</td>
                <td><span className={`badge ${r.promotionRecommended==="Yes"?"badge-success":"badge-neutral"}`}>{r.promotionRecommended}</span></td>
                <td>
                  <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                    <div className="risk-bar" style={{ width:50 }}><div className="risk-bar-fill" style={{ width:`${(r.aiSentimentScore||5)*10}%`, background: r.aiSentimentScore>=7?"#10b981":r.aiSentimentScore>=5?"#3b82f6":"#ef4444" }} /></div>
                    <span style={{ fontSize:12, fontWeight:600 }}>{r.aiSentimentScore?.toFixed(1)}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function TrainingPage() {
  return (
    <div>
      <div className="page-header"><h1 className="page-title">Training & Learning Development</h1><p className="page-subtitle">800+ training records · AI-recommended courses</p></div>
      <div className="grid grid-4" style={{ marginBottom:24 }}>
        {[{l:"Total Enrollments",v:"800"},{l:"Completed",v:"360"},{l:"AI Recommended",v:"320"},{l:"Avg Hours/Employee",v:"32"}].map(({l,v})=>(
          <div key={l} className="kpi-card"><div style={{ fontSize:11, color:"var(--text-muted)", textTransform:"uppercase", letterSpacing:"0.05em", marginBottom:8 }}>{l}</div><div style={{ fontSize:32, fontWeight:800, fontFamily:"var(--font-display)", color:"var(--accent)" }}>{v}</div></div>
        ))}
      </div>
      <div className="card"><p style={{ color:"var(--text-secondary)", textAlign:"center", padding:40 }}>Training records loaded from training_records.csv (800 rows). Connect backend for full management features.</p></div>
    </div>
  );
}

export function PayrollPage() {
  return (
    <div>
      <div className="page-header"><h1 className="page-title">Payroll Management</h1><p className="page-subtitle">1,000+ payroll records · Compensation analytics</p></div>
      <div className="grid grid-4" style={{ marginBottom:24 }}>
        {[{l:"Monthly Payroll",v:"$8.54M"},{l:"Avg Net Pay",v:"$7,120"},{l:"Total Bonuses",v:"$342K"},{l:"YoY Growth",v:"8.4%"}].map(({l,v})=>(
          <div key={l} className="kpi-card"><div style={{ fontSize:11, color:"var(--text-muted)", textTransform:"uppercase", letterSpacing:"0.05em", marginBottom:8 }}>{l}</div><div style={{ fontSize:24, fontWeight:800, fontFamily:"var(--font-display)", color:"var(--success)" }}>{v}</div></div>
        ))}
      </div>
      <div className="card"><p style={{ color:"var(--text-secondary)", textAlign:"center", padding:40 }}>Payroll data loaded from payroll_data.csv (1,000 rows). Role-based access enforced for financial data.</p></div>
    </div>
  );
}

export function ReportsPage() {
  const reports = [
    { id:"headcount", name:"Headcount Report", desc:"Current workforce breakdown by dept, role, location", icon:"👥" },
    { id:"attrition", name:"Attrition Analysis", desc:"Turnover trends, AI risk factors, retention strategies", icon:"📉" },
    { id:"performance", name:"Performance Summary", desc:"Review scores, rating distribution, promotion pipeline", icon:"⭐" },
    { id:"compensation", name:"Compensation Audit", desc:"Salary equity analysis and market benchmarks", icon:"💰" },
    { id:"diversity", name:"D&I Dashboard", desc:"Diversity metrics by department and seniority", icon:"🌍" },
    { id:"training", name:"L&D Report", desc:"Training completion rates and skill development progress", icon:"📚" },
  ];
  return (
    <div>
      <div className="page-header"><h1 className="page-title">Reports & Exports</h1><p className="page-subtitle">Generate AI-powered HR reports for stakeholders</p></div>
      <div className="grid grid-3">
        {reports.map(r => (
          <div key={r.id} className="card" style={{ cursor:"pointer" }} onClick={() => alert(`Generating ${r.name}...`)}>
            <div style={{ fontSize:32, marginBottom:12 }}>{r.icon}</div>
            <h3 style={{ marginBottom:8 }}>{r.name}</h3>
            <p style={{ fontSize:13, color:"var(--text-secondary)", marginBottom:16, lineHeight:1.5 }}>{r.desc}</p>
            <button className="btn btn-primary btn-sm">Generate Report</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SettingsPage() {
  return (
    <div>
      <div className="page-header"><h1 className="page-title">Settings</h1><p className="page-subtitle">Platform configuration and integrations</p></div>
      <div className="grid grid-2">
        {[
          { title:"OpenAI Integration", desc:"Configure your OpenAI API key for AI-powered features", action:"Configure" },
          { title:"HRIS Integration", desc:"Connect with Workday, BambooHR, or SAP SuccessFactors", action:"Connect" },
          { title:"Email Notifications", desc:"Set up automated alerts for high-risk employees", action:"Configure" },
          { title:"Data Import", desc:"Import CSV data files for bulk employee onboarding", action:"Import" },
          { title:"Access Control", desc:"Manage role-based permissions and user access", action:"Manage" },
          { title:"Audit Logs", desc:"View all system actions and data access history", action:"View Logs" },
        ].map(s => (
          <div key={s.title} className="card">
            <h3 style={{ marginBottom:8 }}>{s.title}</h3>
            <p style={{ fontSize:13, color:"var(--text-secondary)", marginBottom:16 }}>{s.desc}</p>
            <button className="btn btn-secondary btn-sm">{s.action}</button>
          </div>
        ))}
      </div>
    </div>
  );
}
