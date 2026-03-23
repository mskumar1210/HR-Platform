import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { TrendingDown, AlertTriangle, Shield, Users, Brain, RefreshCw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from "recharts";
import { aiAPI } from "../utils/api";
import toast from "react-hot-toast";

const riskColors = { Critical: "#ef4444", High: "#f59e0b", Medium: "#3b82f6", Low: "#10b981" };

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 8, padding: "10px 14px" }}>
      <p style={{ color: "var(--text-secondary)", fontSize: 12 }}>{label}</p>
      {payload.map((p, i) => <p key={i} style={{ color: p.color || "var(--text-primary)", fontSize: 13, fontWeight: 600 }}>{p.name}: {p.value}</p>)}
    </div>
  );
};

export default function AttritionPage() {
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["bulk-attrition"],
    queryFn: () => aiAPI.bulkAttrition().then(r => r.data),
  });

  const handleAnalyze = async (empId) => {
    setAnalyzing(true);
    setSelectedEmployee(empId);
    try {
      const { data: res } = await aiAPI.attritionRisk({ employeeId: empId });
      setAnalysis(res.analysis);
      toast.success("AI analysis complete");
    } catch (err) {
      toast.error("Analysis failed – check server connection");
    } finally {
      setAnalyzing(false);
    }
  };

  const summary = data?.summary || {};
  const employees = data?.employees || [];

  const pieData = [
    { name: "Critical", value: summary.critical || 0 },
    { name: "High",     value: summary.high || 0 },
    { name: "Medium",   value: summary.medium || 0 },
    { name: "Low",      value: summary.low || 0 },
  ].filter(d => d.value > 0);

  // Group by dept for bar chart
  const byDept = {};
  employees.forEach(e => {
    if (!byDept[e.department]) byDept[e.department] = { dept: e.department, Critical: 0, High: 0, Medium: 0, Low: 0 };
    byDept[e.department][e.riskLevel] = (byDept[e.department][e.riskLevel] || 0) + 1;
  });
  const deptData = Object.values(byDept).sort((a, b) => (b.Critical + b.High) - (a.Critical + a.High)).slice(0, 8);

  return (
    <div>
      <div className="page-header flex-between">
        <div>
          <h1 className="page-title">Attrition Risk Intelligence</h1>
          <p className="page-subtitle">AI-powered employee retention analysis and early warning system</p>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={() => refetch()}><RefreshCw size={14} />Refresh Analysis</button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-4" style={{ marginBottom: 24 }}>
        {[
          { label: "Critical Risk", value: summary.critical || 0, icon: AlertTriangle, color: "#ef4444", desc: "Immediate attention needed" },
          { label: "High Risk",     value: summary.high || 0,     icon: TrendingDown,  color: "#f59e0b", desc: "Monitor closely" },
          { label: "Medium Risk",   value: summary.medium || 0,   icon: Users,         color: "#3b82f6", desc: "Watch and engage" },
          { label: "Low Risk",      value: summary.low || 0,      icon: Shield,        color: "#10b981", desc: "Engaged & stable" },
        ].map(({ label, value, icon: Icon, color, desc }) => (
          <div key={label} className="kpi-card fade-in">
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
              <div style={{ width: 38, height: 38, borderRadius: 9, background: `${color}18`, border: `1px solid ${color}30`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon size={18} color={color} />
              </div>
              <span style={{ fontSize: 12, fontWeight: 600, color, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</span>
            </div>
            {isLoading ? <div className="skeleton" style={{ height: 36, width: "50%", marginBottom: 8 }} /> : (
              <div style={{ fontSize: 36, fontWeight: 800, fontFamily: "var(--font-display)", color }}>{value}</div>
            )}
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>{desc}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-2" style={{ marginBottom: 24 }}>
        <div className="card">
          <h3 style={{ marginBottom: 20 }}>Risk by Department</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={deptData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="dept" tick={{ fill: "var(--text-muted)", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "var(--text-muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="Critical" stackId="a" fill="#ef4444" radius={[0,0,0,0]} />
              <Bar dataKey="High"     stackId="a" fill="#f59e0b" />
              <Bar dataKey="Medium"   stackId="a" fill="#3b82f6" />
              <Bar dataKey="Low"      stackId="a" fill="#10b981" radius={[4,4,0,0]} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, color: "var(--text-secondary)" }} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 style={{ marginBottom: 20 }}>Risk Distribution</h3>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`} labelLine={false}>
                {pieData.map((d) => <Cell key={d.name} fill={riskColors[d.name]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* At-Risk Employees Table */}
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 10 }}>
          <Brain size={18} color="var(--accent)" />
          <h3>High-Risk Employees — AI Prediction Rankings</h3>
          <span className="badge badge-info" style={{ marginLeft: "auto" }}>Top 100 by Risk Score</span>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Department</th>
                <th>Role</th>
                <th>Risk Level</th>
                <th>Risk Score</th>
                <th>AI Analysis</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={6} style={{ textAlign: "center", padding: 40, color: "var(--text-muted)" }}>Loading AI analysis...</td></tr>
              ) : employees.filter(e => e.riskLevel === "Critical" || e.riskLevel === "High").slice(0, 30).map(emp => (
                <tr key={emp.employeeId}>
                  <td>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{emp.name}</div>
                      <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{emp.employeeId}</div>
                    </div>
                  </td>
                  <td style={{ color: "var(--text-secondary)", fontSize: 13 }}>{emp.department}</td>
                  <td style={{ fontSize: 13 }}>{emp.role}</td>
                  <td>
                    <span className="badge" style={{ background: `${riskColors[emp.riskLevel]}18`, color: riskColors[emp.riskLevel], borderColor: `${riskColors[emp.riskLevel]}30` }}>
                      {emp.riskLevel}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div className="risk-bar" style={{ width: 80 }}>
                        <div className="risk-bar-fill" style={{ width: `${emp.riskScore * 100}%`, background: riskColors[emp.riskLevel] }} />
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 600, color: riskColors[emp.riskLevel] }}>{(emp.riskScore * 100).toFixed(0)}%</span>
                    </div>
                  </td>
                  <td>
                    <button className="btn btn-primary btn-sm" onClick={() => handleAnalyze(emp.employeeId)} disabled={analyzing && selectedEmployee === emp.employeeId} style={{ fontSize: 11 }}>
                      <Brain size={12} />
                      {analyzing && selectedEmployee === emp.employeeId ? "Analyzing..." : "Deep Analysis"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* AI Analysis Modal */}
      {analysis && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 20 }} onClick={() => setAnalysis(null)}>
          <div className="card" style={{ maxWidth: 560, width: "100%", maxHeight: "80vh", overflowY: "auto" }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <h3 style={{ display: "flex", alignItems: "center", gap: 8 }}><Brain size={18} color="var(--accent)" />AI Deep Analysis</h3>
              <button className="btn-icon btn-sm" onClick={() => setAnalysis(null)}>✕</button>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 16, padding: 16, background: "var(--bg-elevated)", borderRadius: 10, marginBottom: 20, border: "1px solid var(--border)" }}>
              <div style={{ fontSize: 36, fontWeight: 800, fontFamily: "var(--font-display)", color: riskColors[analysis.riskLevel] }}>{((analysis.score || 0.5) * 100).toFixed(0)}%</div>
              <div>
                <span className="badge" style={{ background: `${riskColors[analysis.riskLevel]}18`, color: riskColors[analysis.riskLevel], borderColor: `${riskColors[analysis.riskLevel]}30`, marginBottom: 6 }}>{analysis.riskLevel} Risk</span>
                <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>{analysis.timeline}</div>
              </div>
            </div>
            {analysis.keyFactors?.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <h4 style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.05em" }}>Key Risk Factors</h4>
                {analysis.keyFactors.map((f, i) => <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 8, fontSize: 13 }}><span style={{ color: "#ef4444", marginTop: 2 }}>⚠</span>{f}</div>)}
              </div>
            )}
            {analysis.recommendations?.length > 0 && (
              <div>
                <h4 style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.05em" }}>Recommended Actions</h4>
                {analysis.recommendations.map((r, i) => <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 8, fontSize: 13 }}><span style={{ color: "#10b981", marginTop: 2 }}>✓</span>{r}</div>)}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
