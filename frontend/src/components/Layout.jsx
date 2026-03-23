import React from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Users, Briefcase, BarChart3, Brain, TrendingDown,
  BookOpen, DollarSign, FileText, Settings, LogOut, Zap, Bell, Search,
  ChevronDown, Activity
} from "lucide-react";
import useAuthStore from "../hooks/useAuthStore";

const navItems = [
  { section: "Overview" },
  { to: "/dashboard",    icon: LayoutDashboard, label: "Dashboard" },
  { to: "/analytics",    icon: BarChart3,       label: "Analytics" },
  { section: "Talent" },
  { to: "/employees",    icon: Users,           label: "Employees" },
  { to: "/recruitment",  icon: Briefcase,       label: "Recruitment" },
  { to: "/performance",  icon: Activity,        label: "Performance" },
  { to: "/attrition",    icon: TrendingDown,    label: "Attrition Risk" },
  { section: "Operations" },
  { to: "/training",     icon: BookOpen,        label: "Training & L&D" },
  { to: "/payroll",      icon: DollarSign,      label: "Payroll" },
  { to: "/reports",      icon: FileText,        label: "Reports" },
  { section: "AI Tools" },
  { to: "/ai-assistant", icon: Brain,           label: "AI Assistant" },
  { section: "System" },
  { to: "/settings",     icon: Settings,        label: "Settings" },
];

const roleColors = {
  super_admin: "#3b82f6",
  hr_manager:  "#10b981",
  recruiter:   "#f59e0b",
  manager:     "#8b5cf6",
  analyst:     "#14b8a6",
  employee:    "#6b7280",
};

export default function Layout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="main-layout">
      {/* ─── Sidebar ─────────────────────────────────────────────────────────── */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div style={{ width: 32, height: 32, background: "linear-gradient(135deg,#3b82f6,#8b5cf6)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Zap size={18} color="#fff" />
          </div>
          <span className="sidebar-logo-text">TalentIQ</span>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item, i) => {
            if (item.section) return <div key={i} className="nav-section-title">{item.section}</div>;
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `nav-item${isActive ? " active" : ""}`}
              >
                <Icon size={17} />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        {/* User profile at bottom */}
        <div style={{ padding: "12px 16px", borderTop: "1px solid var(--border)", marginTop: "auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px", borderRadius: "var(--radius-sm)", cursor: "pointer" }}>
            <div style={{
              width: 34, height: 34, borderRadius: "50%",
              background: `linear-gradient(135deg, ${roleColors[user?.role] || "#3b82f6"}, #1e293b)`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 13, fontWeight: 700, color: "#fff", flexShrink: 0
            }}>
              {user?.name?.charAt(0) || "U"}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.name || "User"}</div>
              <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "capitalize" }}>{user?.role?.replace("_", " ") || "Staff"}</div>
            </div>
            <button onClick={handleLogout} title="Logout" className="btn-icon" style={{ padding: 6 }}>
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </aside>

      {/* ─── Main Content ─────────────────────────────────────────────────────── */}
      <main className="main-content">
        {/* Top Bar */}
        <header className="top-bar">
          <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1 }}>
            <div style={{ position: "relative", maxWidth: 360, flex: 1 }}>
              <Search size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
              <input
                type="text"
                placeholder="Search employees, applications..."
                className="form-input"
                style={{ paddingLeft: 36, height: 38, fontSize: 13 }}
              />
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button className="btn-icon" style={{ position: "relative" }}>
              <Bell size={16} />
              <span style={{ position: "absolute", top: 4, right: 4, width: 7, height: 7, background: "var(--accent)", borderRadius: "50%", border: "2px solid var(--bg-surface)" }} />
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", padding: "6px 12px", borderRadius: "var(--radius-sm)", background: "var(--bg-elevated)", border: "1px solid var(--border)" }}>
              <div style={{ width: 26, height: 26, borderRadius: "50%", background: `linear-gradient(135deg, ${roleColors[user?.role] || "#3b82f6"}, #1e293b)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700 }}>
                {user?.name?.charAt(0) || "U"}
              </div>
              <span style={{ fontSize: 13, fontWeight: 500 }}>{user?.name?.split(" ")[0]}</span>
              <ChevronDown size={13} style={{ color: "var(--text-muted)" }} />
            </div>
          </div>
        </header>

        <div className="page-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
