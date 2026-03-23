import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Briefcase, Plus, Brain, Search, ChevronLeft, ChevronRight, X, RefreshCw } from "lucide-react";
import { applicationsAPI } from "../utils/api";
import toast from "react-hot-toast";

const statusColors = {
  Applied:"badge-neutral", Screening:"badge-info", "Phone Interview":"badge-purple",
  "Technical Interview":"badge-warning", "Offer Extended":"badge-success",
  Hired:"badge-success", Rejected:"badge-danger", Withdrawn:"badge-neutral"
};

const DEPARTMENTS = ["Engineering","Product","Design","Marketing","Sales","HR","Finance","Legal","Operations","Customer Success","Data Science","DevOps","QA","Security","Research"];
const JOB_TITLES  = ["Software Engineer","Senior Software Engineer","Product Manager","Data Scientist","DevOps Engineer","UX Designer","Marketing Manager","Sales Executive","HR Business Partner","Security Engineer","QA Engineer","Full Stack Developer","Frontend Developer","Backend Developer","ML Engineer","Data Analyst","Finance Manager","Legal Counsel","Operations Manager"];
const SOURCES     = ["LinkedIn","Indeed","Referral","Company Website","Glassdoor","Campus Recruitment","Headhunter","AngelList","Twitter/X","Friend Referral"];
const STAGES      = ["Applied","Screening","Phone Interview","Technical Interview","Offer Extended","Hired","Rejected","Withdrawn"];

// ── Add Application Modal ─────────────────────────────────────────────────────
function AddApplicationModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({
    candidateName:"", email:"", jobTitle:"Software Engineer",
    department:"Engineering", source:"LinkedIn", status:"Applied",
    yearsExperience:"0", educationLevel:"Bachelor's",
    expectedSalary:"", locationPreference:"Remote",
    skillsMatchScore:"70", aiCompatibilityScore:"70",
    resumeKeywordsMatched:"15",
  });
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState("");

  const set = (key, val) => setForm(f=>({...f,[key]:val}));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.candidateName.trim()) return setError("Candidate name is required");
    if (!form.email.trim())         return setError("Email is required");
    if (!form.expectedSalary)       return setError("Expected salary is required");

    setSaving(true);
    try {
      const payload = {
        ...form,
        yearsExperience:       parseInt(form.yearsExperience)       || 0,
        expectedSalary:        parseInt(form.expectedSalary)        || 0,
        skillsMatchScore:      parseFloat(form.skillsMatchScore)    || 70,
        aiCompatibilityScore:  parseFloat(form.aiCompatibilityScore)|| 70,
        resumeKeywordsMatched: parseInt(form.resumeKeywordsMatched) || 15,
        appliedDate:           new Date().toISOString(),
      };
      await applicationsAPI.create(payload);
      toast.success(`Application for ${form.candidateName} added successfully!`);
      onSuccess();
      onClose();
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.errors?.[0]?.msg || err.message || "Failed to add application";
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.75)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:20}} onClick={onClose}>
      <div className="card" style={{maxWidth:680,width:"100%",maxHeight:"90vh",overflowY:"auto",padding:28}} onClick={e=>e.stopPropagation()}>

        {/* Header */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:24}}>
          <div>
            <h2 style={{fontFamily:"var(--font-display)",fontSize:20}}>Add New Application</h2>
            <p style={{fontSize:13,color:"var(--text-secondary)",marginTop:3}}>Add a candidate to the recruitment pipeline</p>
          </div>
          <button className="btn-icon" onClick={onClose}><X size={18}/></button>
        </div>

        {/* Error */}
        {error && (
          <div style={{background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.3)",borderRadius:8,padding:"10px 14px",marginBottom:16,color:"#ef4444",fontSize:13}}>
            ⚠ {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>

          {/* Row 1 — Candidate Name + Email */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
            <div className="form-group" style={{marginBottom:0}}>
              <label className="form-label">Candidate Full Name *</label>
              <input className="form-input" value={form.candidateName} onChange={e=>set("candidateName",e.target.value)} placeholder="Jane Doe" required/>
            </div>
            <div className="form-group" style={{marginBottom:0}}>
              <label className="form-label">Email Address *</label>
              <input className="form-input" type="email" value={form.email} onChange={e=>set("email",e.target.value)} placeholder="jane.doe@email.com" required/>
            </div>
          </div>

          {/* Row 2 — Job Title + Department */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
            <div className="form-group" style={{marginBottom:0}}>
              <label className="form-label">Job Title *</label>
              <select className="form-input" value={form.jobTitle} onChange={e=>set("jobTitle",e.target.value)}>
                {JOB_TITLES.map(t=><option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="form-group" style={{marginBottom:0}}>
              <label className="form-label">Department *</label>
              <select className="form-input" value={form.department} onChange={e=>set("department",e.target.value)}>
                {DEPARTMENTS.map(d=><option key={d}>{d}</option>)}
              </select>
            </div>
          </div>

          {/* Row 3 — Source + Stage */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
            <div className="form-group" style={{marginBottom:0}}>
              <label className="form-label">Application Source</label>
              <select className="form-input" value={form.source} onChange={e=>set("source",e.target.value)}>
                {SOURCES.map(s=><option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-group" style={{marginBottom:0}}>
              <label className="form-label">Current Stage</label>
              <select className="form-input" value={form.status} onChange={e=>set("status",e.target.value)}>
                {STAGES.map(s=><option key={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {/* Row 4 — Experience + Education */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
            <div className="form-group" style={{marginBottom:0}}>
              <label className="form-label">Years of Experience</label>
              <input className="form-input" type="number" value={form.yearsExperience} onChange={e=>set("yearsExperience",e.target.value)} min="0" max="50"/>
            </div>
            <div className="form-group" style={{marginBottom:0}}>
              <label className="form-label">Education Level</label>
              <select className="form-input" value={form.educationLevel} onChange={e=>set("educationLevel",e.target.value)}>
                {["High School","Associate's","Bachelor's","Master's","PhD","MBA","JD"].map(e=><option key={e}>{e}</option>)}
              </select>
            </div>
          </div>

          {/* Row 5 — Expected Salary + Location */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
            <div className="form-group" style={{marginBottom:0}}>
              <label className="form-label">Expected Salary (USD) *</label>
              <input className="form-input" type="number" value={form.expectedSalary} onChange={e=>set("expectedSalary",e.target.value)} placeholder="90000" min="0" required/>
            </div>
            <div className="form-group" style={{marginBottom:0}}>
              <label className="form-label">Location Preference</label>
              <select className="form-input" value={form.locationPreference} onChange={e=>set("locationPreference",e.target.value)}>
                <option>Remote</option><option>Hybrid</option><option>On-site</option>
              </select>
            </div>
          </div>

          {/* AI Scores */}
          <div style={{background:"var(--bg-elevated)",border:"1px solid var(--border)",borderRadius:10,padding:16,marginBottom:20}}>
            <p style={{fontSize:12,fontWeight:600,color:"var(--text-secondary)",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:14}}>AI Scoring</p>

            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
              <div>
                <label className="form-label">Skills Match Score: <strong style={{color:"var(--accent)"}}>{form.skillsMatchScore}%</strong></label>
                <input type="range" min="0" max="100" value={form.skillsMatchScore} onChange={e=>set("skillsMatchScore",e.target.value)} style={{width:"100%",accentColor:"var(--accent)"}}/>
              </div>
              <div>
                <label className="form-label">AI Compatibility Score: <strong style={{color:"var(--purple)"}}>{form.aiCompatibilityScore}%</strong></label>
                <input type="range" min="0" max="100" value={form.aiCompatibilityScore} onChange={e=>set("aiCompatibilityScore",e.target.value)} style={{width:"100%",accentColor:"#8b5cf6"}}/>
              </div>
            </div>

            <div style={{marginTop:12}}>
              <label className="form-label">Resume Keywords Matched: <strong style={{color:"var(--success)"}}>{form.resumeKeywordsMatched}</strong></label>
              <input type="range" min="0" max="50" value={form.resumeKeywordsMatched} onChange={e=>set("resumeKeywordsMatched",e.target.value)} style={{width:"100%",accentColor:"#10b981"}}/>
            </div>
          </div>

          {/* Buttons */}
          <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "Adding Application..." : "Add Application"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function RecruitmentPage() {
  const queryClient = useQueryClient();
  const [page,      setPage]      = useState(1);
  const [status,    setStatus]    = useState("");
  const [search,    setSearch]    = useState("");
  const [showModal, setShowModal] = useState(false);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["applications", page, status],
    queryFn:  () => applicationsAPI.list({ page, limit:20, ...(status&&{status}) }).then(r=>r.data),
    keepPreviousData: true,
  });

  const apps       = data?.applications || [];
  const pagination = data?.pagination   || {};

  // Pipeline counts
  const pipelineCounts = {
    Applied:    apps.filter(a=>a.status==="Applied").length,
    Interviewing: apps.filter(a=>["Screening","Phone Interview","Technical Interview"].includes(a.status)).length,
    "Offer":    apps.filter(a=>a.status==="Offer Extended").length,
    Hired:      apps.filter(a=>a.status==="Hired").length,
  };

  const filtered = search
    ? apps.filter(a => a.candidateName?.toLowerCase().includes(search.toLowerCase()) || a.email?.toLowerCase().includes(search.toLowerCase()) || a.jobTitle?.toLowerCase().includes(search.toLowerCase()))
    : apps;

  return (
    <div>
      {/* Header */}
      <div className="page-header flex-between">
        <div>
          <h1 className="page-title">Recruitment Pipeline</h1>
          <p className="page-subtitle">{pagination.total||0} total applications · AI-powered candidate scoring</p>
        </div>
        <div style={{display:"flex",gap:10}}>
          <button className="btn btn-secondary btn-sm" onClick={()=>refetch()}><RefreshCw size={14}/>Refresh</button>
          <button className="btn btn-primary btn-sm" onClick={()=>setShowModal(true)}>
            <Plus size={14}/>Add Application
          </button>
        </div>
      </div>

      {/* Pipeline Stage Cards */}
      <div className="grid grid-4" style={{marginBottom:20}}>
        {[
          {stage:"Applied",      color:"#6b7280", icon:"📥"},
          {stage:"Interviewing", color:"#3b82f6", icon:"🎤"},
          {stage:"Offer",        color:"#f59e0b", icon:"📄"},
          {stage:"Hired",        color:"#10b981", icon:"✅"},
        ].map(({stage,color,icon})=>(
          <div key={stage} className="kpi-card" style={{cursor:"pointer"}} onClick={()=>setStatus(stage==="Interviewing"?"Screening":stage==="Offer"?"Offer Extended":stage==="Applied"?"Applied":"Hired")}>
            <div style={{fontSize:24,marginBottom:8}}>{icon}</div>
            <div style={{fontSize:28,fontWeight:800,color,fontFamily:"var(--font-display)"}}>{pipelineCounts[stage]||0}</div>
            <div style={{fontSize:12,color:"var(--text-secondary)",marginTop:4}}>{stage}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="card" style={{marginBottom:16,padding:"14px 18px"}}>
        <div style={{display:"flex",gap:12,alignItems:"center",flexWrap:"wrap"}}>
          <div style={{position:"relative",flex:1,minWidth:220}}>
            <Search size={14} style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",color:"var(--text-muted)"}}/>
            <input type="text" placeholder="Search candidate, email, role..." value={search} onChange={e=>setSearch(e.target.value)} className="form-input" style={{paddingLeft:34,height:38}}/>
          </div>
          <select value={status} onChange={e=>{setStatus(e.target.value);setPage(1);}} className="form-input" style={{width:210}}>
            <option value="">All Stages</option>
            {STAGES.map(s=><option key={s}>{s}</option>)}
          </select>
          {status && (
            <button className="btn btn-secondary btn-sm" onClick={()=>setStatus("")}>Clear Filter ✕</button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="card" style={{padding:0,overflow:"hidden"}}>
        <div style={{overflowX:"auto"}}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Candidate</th><th>Position</th><th>Department</th><th>Stage</th>
                <th>AI Score</th><th>Skills Match</th><th>Expected Salary</th><th>Applied</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={8} style={{textAlign:"center",padding:40,color:"var(--text-muted)"}}>Loading applications...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={8} style={{textAlign:"center",padding:40,color:"var(--text-muted)"}}>
                  No applications found.
                  <button className="btn btn-primary btn-sm" style={{marginLeft:12}} onClick={()=>setShowModal(true)}>Add First Application</button>
                </td></tr>
              ) : filtered.map(app=>(
                <tr key={app._id}>
                  <td>
                    <div style={{fontWeight:600,fontSize:14}}>{app.candidateName}</div>
                    <div style={{fontSize:12,color:"var(--text-muted)"}}>{app.email}</div>
                  </td>
                  <td style={{fontSize:13}}>{app.jobTitle}</td>
                  <td style={{fontSize:13,color:"var(--text-secondary)"}}>{app.department}</td>
                  <td><span className={`badge ${statusColors[app.status]||"badge-neutral"}`}>{app.status}</span></td>
                  <td>
                    <div style={{display:"flex",alignItems:"center",gap:6}}>
                      <div className="risk-bar" style={{width:50}}>
                        <div className="risk-bar-fill" style={{width:`${app.aiCompatibilityScore||0}%`,background:app.aiCompatibilityScore>=75?"#10b981":app.aiCompatibilityScore>=55?"#f59e0b":"#ef4444"}}/>
                      </div>
                      <span style={{fontSize:12,fontWeight:600}}>{app.aiCompatibilityScore?.toFixed(0)}%</span>
                    </div>
                  </td>
                  <td>
                    <span style={{fontSize:13,fontWeight:600,color:app.skillsMatchScore>=75?"var(--success)":"var(--warning)"}}>
                      {app.skillsMatchScore?.toFixed(0)}%
                    </span>
                  </td>
                  <td style={{fontSize:13,fontWeight:600}}>${app.expectedSalary?.toLocaleString()}</td>
                  <td style={{fontSize:12,color:"var(--text-muted)"}}>{app.appliedDate?new Date(app.appliedDate).toLocaleDateString():"—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.pages>1 && (
          <div style={{padding:"14px 20px",borderTop:"1px solid var(--border)",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <span style={{fontSize:13,color:"var(--text-muted)"}}>
              Page {page} of {pagination.pages}
            </span>
            <div style={{display:"flex",gap:6}}>
              <button className="btn btn-secondary btn-sm" onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1}><ChevronLeft size={14}/></button>
              <button className="btn btn-secondary btn-sm" onClick={()=>setPage(p=>Math.min(pagination.pages,p+1))} disabled={page===pagination.pages}><ChevronRight size={14}/></button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <AddApplicationModal
          onClose={()=>setShowModal(false)}
          onSuccess={()=>{ queryClient.invalidateQueries(["applications"]); refetch(); }}
        />
      )}
    </div>
  );
}
