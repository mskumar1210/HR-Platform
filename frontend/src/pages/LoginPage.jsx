import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Zap, Brain, TrendingUp, Users } from "lucide-react";
import useAuthStore from "../hooks/useAuthStore";
import toast from "react-hot-toast";

const demoAccounts = [
  { role: "Super Admin",  email: "admin@talentiq.com",     password: "Admin@1234" },
  { role: "HR Manager",   email: "hr@talentiq.com",        password: "Admin@1234" },
  { role: "Recruiter",    email: "recruiter@talentiq.com", password: "Admin@1234" },
];

export default function LoginPage() {
  const [email, setEmail] = useState("admin@talentiq.com");
  const [password, setPassword] = useState("Admin@1234");
  const [showPass, setShowPass] = useState(false);
  const { login, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Login clicked with:", email, password);
    try {
      const result = await login(email, password);
      console.log("Login result:", result);
      toast.success("Welcome back!");
      navigate("/dashboard");
    } catch (err) {
      console.error("Login error:", err);
      toast.error(err.message || "Login failed");
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-base)", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", position: "relative", overflow: "hidden" }}>
      {/* Background decoration */}
      <div style={{ position: "absolute", top: -200, right: -200, width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: -200, left: -200, width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)", pointerEvents: "none" }} />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60, maxWidth: 1000, width: "100%", alignItems: "center" }}>
        {/* Left: Branding */}
        <div className="fade-in">
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 32 }}>
            <div style={{ width: 48, height: 48, background: "linear-gradient(135deg,#3b82f6,#8b5cf6)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Zap size={26} color="#fff" />
            </div>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: 32, fontWeight: 800, background: "linear-gradient(135deg,#3b82f6,#8b5cf6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>TalentIQ</h1>
          </div>
          <h2 style={{ fontSize: "clamp(1.4rem,3vw,2rem)", fontWeight: 800, marginBottom: 16, lineHeight: 1.2 }}>
            AI-Powered HR &<br />Talent Intelligence
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: 15, lineHeight: 1.7, marginBottom: 36 }}>
            The complete HR platform for modern enterprises. Predict attrition, screen candidates with AI, and make data-driven talent decisions.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {[
              { icon: Brain, text: "AI-powered attrition prediction & risk scoring" },
              { icon: Users, text: "Intelligent candidate screening & matching" },
              { icon: TrendingUp, text: "Real-time workforce analytics & insights" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Icon size={18} color="var(--accent)" />
                </div>
                <span style={{ fontSize: 14, color: "var(--text-secondary)" }}>{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Login form */}
        <div className="card fade-in" style={{ animationDelay: "0.15s" }}>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: 22, marginBottom: 6 }}>Sign in</h3>
          <p style={{ color: "var(--text-secondary)", fontSize: 14, marginBottom: 28 }}>Access your TalentIQ workspace</p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email address</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="form-input" placeholder="you@company.com" required />
            </div>
            <div className="form-group" style={{ position: "relative" }}>
              <label className="form-label">Password</label>
              <input type={showPass ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} className="form-input" placeholder="••••••••" required style={{ paddingRight: 44 }} />
              <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: "absolute", right: 12, top: 34, background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}>
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: "100%", justifyContent: "center", height: 44, fontSize: 15, marginTop: 8 }} disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign in to TalentIQ"}
            </button>
          </form>

          {/* Demo accounts */}
          <div style={{ marginTop: 24, paddingTop: 24, borderTop: "1px solid var(--border)" }}>
            <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 12, textAlign: "center" }}>DEMO ACCOUNTS</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {demoAccounts.map(a => (
                <button key={a.email} onClick={() => { setEmail(a.email); setPassword(a.password); }} className="btn btn-secondary btn-sm" style={{ justifyContent: "space-between", fontSize: 12 }}>
                  <span style={{ color: "var(--accent)", fontWeight: 600 }}>{a.role}</span>
                  <span style={{ color: "var(--text-muted)" }}>{a.email}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
