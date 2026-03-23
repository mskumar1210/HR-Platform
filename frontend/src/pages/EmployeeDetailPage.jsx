// EmployeeDetailPage.jsx
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Mail, MapPin, Calendar, DollarSign, Star, Brain } from "lucide-react";
import { employeesAPI } from "../utils/api";

export default function EmployeeDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: emp, isLoading } = useQuery({ queryKey: ["employee", id], queryFn: () => employeesAPI.get(id).then(r => r.data) });
  if (isLoading) return <div style={{ textAlign: "center", padding: 60, color: "var(--text-muted)" }}>Loading employee...</div>;
  if (!emp) return <div style={{ textAlign: "center", padding: 60, color: "var(--danger)" }}>Employee not found</div>;
  return (
    <div>
      <button className="btn btn-secondary btn-sm" onClick={() => navigate(-1)} style={{ marginBottom: 20 }}><ArrowLeft size={14} />Back to Employees</button>
      <div className="grid grid-2">
        <div className="card">
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: `hsl(${emp.firstName?.charCodeAt(0) * 15 % 360},60%,35%)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 700 }}>{emp.firstName?.[0]}{emp.lastName?.[0]}</div>
            <div>
              <h2 style={{ fontFamily: "var(--font-display)" }}>{emp.firstName} {emp.lastName}</h2>
              <p style={{ color: "var(--text-secondary)" }}>{emp.role} · {emp.department}</p>
              <p style={{ fontSize: 13, color: "var(--text-muted)" }}>{emp.employeeId}</p>
            </div>
          </div>
          {[
            { icon: Mail,     label: "Email",     value: emp.email },
            { icon: MapPin,   label: "Location",  value: `${emp.city}, ${emp.state}` },
            { icon: Calendar, label: "Hire Date", value: new Date(emp.hireDate).toLocaleDateString() },
            { icon: DollarSign,label:"Salary",    value: `$${emp.salary?.toLocaleString()}` },
            { icon: Star,     label: "Rating",    value: emp.performanceRating },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
              <Icon size={16} color="var(--text-muted)" />
              <span style={{ fontSize: 13, color: "var(--text-muted)", width: 90 }}>{label}</span>
              <span style={{ fontSize: 13 }}>{value}</span>
            </div>
          ))}
        </div>
        <div className="card">
          <h3 style={{ marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}><Brain size={18} color="var(--accent)" />Skills & Intelligence</h3>
          <div style={{ marginBottom: 16 }}>
            <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.05em" }}>Skills</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {emp.skills?.map(s => <span key={s} className="badge badge-info">{s}</span>)}
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {[
              { label: "Satisfaction", value: `${emp.satisfactionScore}/10` },
              { label: "Tenure", value: `${emp.tenureMonths} months` },
              { label: "Promotions", value: emp.promotionsCount },
              { label: "Training Hrs", value: emp.trainingHoursYtd },
              { label: "Overtime/mo", value: `${emp.overtimeHoursMonthly}h` },
              { label: "Remote Work", value: emp.remoteWork },
            ].map(({ label, value }) => (
              <div key={label} style={{ background: "var(--bg-elevated)", borderRadius: 8, padding: "10px 12px", border: "1px solid var(--border)" }}>
                <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>{label}</div>
                <div style={{ fontSize: 15, fontWeight: 600 }}>{value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
