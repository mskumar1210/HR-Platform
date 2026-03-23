import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Search, Filter, Plus, Download, RefreshCw, ChevronLeft, ChevronRight, X } from "lucide-react";
import { employeesAPI } from "../utils/api";
import toast from "react-hot-toast";

// ── Badge helpers ─────────────────────────────────────────────────────────────
const statusBadge = (status) => {
  const map = { Active:"badge-success", Terminated:"badge-danger", "On Leave":"badge-warning", Probation:"badge-purple" };
  return <span className={`badge ${map[status]||"badge-neutral"}`}>{status}</span>;
};
const perfBadge = (perf) => {
  const map = { Outstanding:"badge-success","Exceeds Expectations":"badge-info","Meets Expectations":"badge-neutral","Needs Improvement":"badge-warning","Below Expectations":"badge-danger" };
  return <span className={`badge ${map[perf]||"badge-neutral"}`}>{perf}</span>;
};
const riskBar = (risk) => {
  const color = risk>=0.7?"#ef4444":risk>=0.5?"#f59e0b":risk>=0.3?"#3b82f6":"#10b981";
  return (
    <div style={{display:"flex",alignItems:"center",gap:8}}>
      <div className="risk-bar" style={{width:60}}>
        <div className="risk-bar-fill" style={{width:`${(risk||0)*100}%`,background:color}}/>
      </div>
      <span style={{fontSize:12,color,fontWeight:600}}>{((risk||0)*100).toFixed(0)}%</span>
    </div>
  );
};

const DEPARTMENTS = ["Engineering","Product","Design","Marketing","Sales","HR","Finance","Legal","Operations","Customer Success","Data Science","DevOps","QA","Security","Research"];
const ROLES_BY_DEPT = {
  Engineering:["Software Engineer I","Software Engineer II","Senior Software Engineer","Staff Engineer","Engineering Manager","VP Engineering","CTO"],
  Product:["Associate PM","Product Manager","Senior PM","Director of Product","VP Product","CPO"],
  Design:["UX Designer","UI Designer","Senior Designer","Lead Designer","Design Manager"],
  Marketing:["Marketing Coordinator","Marketing Specialist","Marketing Manager","Director of Marketing","CMO"],
  Sales:["Sales Development Rep","Account Executive","Senior AE","Sales Manager","Director of Sales","VP Sales"],
  HR:["HR Coordinator","HR Specialist","HR Business Partner","HR Manager","Director of HR","CHRO"],
  Finance:["Financial Analyst","Senior Analyst","Finance Manager","Controller","CFO"],
  Legal:["Legal Counsel","Senior Counsel","General Counsel"],
  Operations:["Operations Analyst","Operations Manager","Director of Operations","COO"],
  "Customer Success":["CS Specialist","CS Manager","Director of CS","VP CS"],
  "Data Science":["Data Analyst","Data Scientist","Senior Data Scientist","ML Engineer","Head of Data"],
  DevOps:["DevOps Engineer","Senior DevOps","Platform Engineer","DevOps Manager"],
  QA:["QA Engineer","Senior QA","QA Lead","QA Manager"],
  Security:["Security Analyst","Security Engineer","Security Architect","CISO"],
  Research:["Research Scientist","Senior Researcher","Research Director"],
};

// ── Add Employee Modal ────────────────────────────────────────────────────────
function AddEmployeeModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({
    firstName:"", lastName:"", email:"", department:"Engineering", role:"Software Engineer I",
    salary:"", hireDate: new Date().toISOString().split("T")[0],
    city:"", state:"", educationLevel:"Bachelor's", yearsExperience:"0",
    remoteWork:"Hybrid", employmentStatus:"Active", satisfactionScore:"7",
    skills:"", phone:"",
  });
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState("");

  const set = (key, val) => setForm(f => ({...f, [key]: val}));

  const handleDeptChange = (dept) => {
    set("department", dept);
    set("role", ROLES_BY_DEPT[dept]?.[0] || "");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Basic validation
    if (!form.firstName.trim()) return setError("First name is required");
    if (!form.lastName.trim())  return setError("Last name is required");
    if (!form.email.trim())     return setError("Email is required");
    if (!form.salary)           return setError("Salary is required");

    setSaving(true);
    try {
      const payload = {
        ...form,
        salary:          parseFloat(form.salary),
        yearsExperience: parseInt(form.yearsExperience) || 0,
        satisfactionScore: parseFloat(form.satisfactionScore) || 7,
        hireDate:        new Date(form.hireDate).toISOString(),
        skills:          form.skills ? form.skills.split(",").map(s=>s.trim()).filter(Boolean) : [],
      };
      await employeesAPI.create(payload);
      toast.success(`Employee ${form.firstName} ${form.lastName} added successfully!`);
      onSuccess();
      onClose();
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.errors?.[0]?.msg || err.message || "Failed to add employee";
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
            <h2 style={{fontFamily:"var(--font-display)",fontSize:20}}>Add New Employee</h2>
            <p style={{fontSize:13,color:"var(--text-secondary)",marginTop:3}}>Fill in the details below to add a new employee</p>
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
          {/* Row 1 — Name */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
            <div className="form-group" style={{marginBottom:0}}>
              <label className="form-label">First Name *</label>
              <input className="form-input" value={form.firstName} onChange={e=>set("firstName",e.target.value)} placeholder="John" required/>
            </div>
            <div className="form-group" style={{marginBottom:0}}>
              <label className="form-label">Last Name *</label>
              <input className="form-input" value={form.lastName} onChange={e=>set("lastName",e.target.value)} placeholder="Smith" required/>
            </div>
          </div>

          {/* Row 2 — Email + Phone */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
            <div className="form-group" style={{marginBottom:0}}>
              <label className="form-label">Email Address *</label>
              <input className="form-input" type="email" value={form.email} onChange={e=>set("email",e.target.value)} placeholder="john.smith@company.com" required/>
            </div>
            <div className="form-group" style={{marginBottom:0}}>
              <label className="form-label">Phone</label>
              <input className="form-input" value={form.phone} onChange={e=>set("phone",e.target.value)} placeholder="+1 555 000 0000"/>
            </div>
          </div>

          {/* Row 3 — Department + Role */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
            <div className="form-group" style={{marginBottom:0}}>
              <label className="form-label">Department *</label>
              <select className="form-input" value={form.department} onChange={e=>handleDeptChange(e.target.value)}>
                {DEPARTMENTS.map(d=><option key={d}>{d}</option>)}
              </select>
            </div>
            <div className="form-group" style={{marginBottom:0}}>
              <label className="form-label">Role *</label>
              <select className="form-input" value={form.role} onChange={e=>set("role",e.target.value)}>
                {(ROLES_BY_DEPT[form.department]||[]).map(r=><option key={r}>{r}</option>)}
              </select>
            </div>
          </div>

          {/* Row 4 — Salary + Hire Date */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
            <div className="form-group" style={{marginBottom:0}}>
              <label className="form-label">Annual Salary (USD) *</label>
              <input className="form-input" type="number" value={form.salary} onChange={e=>set("salary",e.target.value)} placeholder="85000" min="0" required/>
            </div>
            <div className="form-group" style={{marginBottom:0}}>
              <label className="form-label">Hire Date *</label>
              <input className="form-input" type="date" value={form.hireDate} onChange={e=>set("hireDate",e.target.value)} required/>
            </div>
          </div>

          {/* Row 5 — City + State */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
            <div className="form-group" style={{marginBottom:0}}>
              <label className="form-label">City</label>
              <input className="form-input" value={form.city} onChange={e=>set("city",e.target.value)} placeholder="San Francisco"/>
            </div>
            <div className="form-group" style={{marginBottom:0}}>
              <label className="form-label">State</label>
              <input className="form-input" value={form.state} onChange={e=>set("state",e.target.value)} placeholder="CA"/>
            </div>
          </div>

          {/* Row 6 — Education + Experience */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
            <div className="form-group" style={{marginBottom:0}}>
              <label className="form-label">Education Level</label>
              <select className="form-input" value={form.educationLevel} onChange={e=>set("educationLevel",e.target.value)}>
                {["High School","Associate's","Bachelor's","Master's","PhD","MBA","JD"].map(e=><option key={e}>{e}</option>)}
              </select>
            </div>
            <div className="form-group" style={{marginBottom:0}}>
              <label className="form-label">Years of Experience</label>
              <input className="form-input" type="number" value={form.yearsExperience} onChange={e=>set("yearsExperience",e.target.value)} min="0" max="50"/>
            </div>
          </div>

          {/* Row 7 — Remote + Status */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
            <div className="form-group" style={{marginBottom:0}}>
              <label className="form-label">Remote Work</label>
              <select className="form-input" value={form.remoteWork} onChange={e=>set("remoteWork",e.target.value)}>
                <option>Yes</option><option>No</option><option>Hybrid</option>
              </select>
            </div>
            <div className="form-group" style={{marginBottom:0}}>
              <label className="form-label">Employment Status</label>
              <select className="form-input" value={form.employmentStatus} onChange={e=>set("employmentStatus",e.target.value)}>
                <option>Active</option><option>Probation</option><option>On Leave</option>
              </select>
            </div>
          </div>

          {/* Skills */}
          <div className="form-group" style={{marginBottom:14}}>
            <label className="form-label">Skills (comma separated)</label>
            <input className="form-input" value={form.skills} onChange={e=>set("skills",e.target.value)} placeholder="Python, React, SQL, AWS"/>
          </div>

          {/* Satisfaction */}
          <div className="form-group" style={{marginBottom:20}}>
            <label className="form-label">Initial Satisfaction Score (1–10): <strong style={{color:"var(--accent)"}}>{form.satisfactionScore}</strong></label>
            <input type="range" min="1" max="10" step="0.5" value={form.satisfactionScore} onChange={e=>set("satisfactionScore",e.target.value)} style={{width:"100%",accentColor:"var(--accent)"}}/>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:"var(--text-muted)",marginTop:4}}>
              <span>1 — Very Dissatisfied</span><span>10 — Very Satisfied</span>
            </div>
          </div>

          {/* Buttons */}
          <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "Adding Employee..." : "Add Employee"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function EmployeesPage() {
  const navigate     = useNavigate();
  const queryClient  = useQueryClient();
  const [page,       setPage]       = useState(1);
  const [search,     setSearch]     = useState("");
  const [dept,       setDept]       = useState("");
  const [status,     setStatus]     = useState("");
  const [showModal,  setShowModal]  = useState(false);

  const params = { page, limit:20, ...(search&&{search}), ...(dept&&dept!=="All"&&{department:dept}), ...(status&&{status}) };

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["employees", params],
    queryFn:  () => employeesAPI.list(params).then(r=>r.data),
    keepPreviousData: true,
  });

  const employees  = data?.employees  || [];
  const pagination = data?.pagination || {};

  return (
    <div>
      {/* Header */}
      <div className="page-header flex-between">
        <div>
          <h1 className="page-title">Employees</h1>
          <p className="page-subtitle">{pagination.total?.toLocaleString()||"..."} total employees across all departments</p>
        </div>
        <div style={{display:"flex",gap:10}}>
          <button className="btn btn-secondary btn-sm" onClick={()=>refetch()}><RefreshCw size={14}/>Refresh</button>
          <button className="btn btn-secondary btn-sm"><Download size={14}/>Export</button>
          <button className="btn btn-primary btn-sm" onClick={()=>setShowModal(true)}>
            <Plus size={14}/>Add Employee
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card" style={{marginBottom:20,padding:"16px 20px"}}>
        <div style={{display:"flex",gap:12,flexWrap:"wrap",alignItems:"center"}}>
          <div style={{position:"relative",flex:1,minWidth:240}}>
            <Search size={14} style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",color:"var(--text-muted)"}}/>
            <input type="text" placeholder="Search name, email, role..." value={search}
              onChange={e=>{setSearch(e.target.value);setPage(1);}}
              className="form-input" style={{paddingLeft:34,height:38}}/>
          </div>
          <select value={dept} onChange={e=>{setDept(e.target.value);setPage(1);}} className="form-input" style={{width:180}}>
            <option value="">All Departments</option>
            {DEPARTMENTS.map(d=><option key={d}>{d}</option>)}
          </select>
          <select value={status} onChange={e=>{setStatus(e.target.value);setPage(1);}} className="form-input" style={{width:160}}>
            <option value="">All Status</option>
            <option>Active</option><option>Terminated</option><option>On Leave</option><option>Probation</option>
          </select>
          <div style={{display:"flex",alignItems:"center",gap:6,color:"var(--text-muted)",fontSize:13}}>
            <Filter size={14}/><span>{pagination.total||0} results</span>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card" style={{padding:0,overflow:"hidden"}}>
        {isLoading ? (
          <div style={{padding:40,textAlign:"center",color:"var(--text-muted)"}}>Loading employees...</div>
        ) : employees.length === 0 ? (
          <div style={{padding:40,textAlign:"center",color:"var(--text-muted)"}}>
            No employees found. <button className="btn btn-primary btn-sm" style={{marginLeft:12}} onClick={()=>setShowModal(true)}>Add First Employee</button>
          </div>
        ) : (
          <div style={{overflowX:"auto"}}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Employee</th><th>Department</th><th>Role</th><th>Status</th>
                  <th>Performance</th><th>Salary</th><th>Attrition Risk</th><th>Satisfaction</th>
                </tr>
              </thead>
              <tbody>
                {employees.map(emp=>(
                  <tr key={emp._id} style={{cursor:"pointer"}} onClick={()=>navigate(`/employees/${emp.employeeId}`)}>
                    <td>
                      <div style={{display:"flex",alignItems:"center",gap:10}}>
                        <div style={{width:32,height:32,borderRadius:"50%",background:`hsl(${(emp.firstName?.charCodeAt(0)||65)*15%360},60%,35%)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700,flexShrink:0}}>
                          {emp.firstName?.[0]}{emp.lastName?.[0]}
                        </div>
                        <div>
                          <div style={{fontWeight:600,fontSize:14}}>{emp.firstName} {emp.lastName}</div>
                          <div style={{fontSize:12,color:"var(--text-muted)"}}>{emp.employeeId}</div>
                        </div>
                      </div>
                    </td>
                    <td><span style={{color:"var(--text-secondary)",fontSize:13}}>{emp.department}</span></td>
                    <td><span style={{fontSize:13}}>{emp.role}</span></td>
                    <td>{statusBadge(emp.employmentStatus)}</td>
                    <td>{perfBadge(emp.performanceRating)}</td>
                    <td style={{fontWeight:600}}>${emp.salary?.toLocaleString()}</td>
                    <td>{riskBar(emp.attritionRisk)}</td>
                    <td>
                      <div style={{display:"flex",alignItems:"center",gap:6}}>
                        <span style={{fontSize:13,fontWeight:600,color:emp.satisfactionScore>=7?"var(--success)":emp.satisfactionScore>=5?"var(--warning)":"var(--danger)"}}>
                          {emp.satisfactionScore?.toFixed(1)}
                        </span>
                        <span style={{fontSize:12,color:"var(--text-muted)"}}>/10</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div style={{padding:"14px 20px",borderTop:"1px solid var(--border)",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <span style={{fontSize:13,color:"var(--text-muted)"}}>
              Showing {((page-1)*20)+1}–{Math.min(page*20,pagination.total)} of {pagination.total?.toLocaleString()}
            </span>
            <div style={{display:"flex",gap:6}}>
              <button className="btn btn-secondary btn-sm" onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1}><ChevronLeft size={14}/></button>
              {Array.from({length:Math.min(5,pagination.pages)},(_,i)=>{
                const p = page<=3?i+1:page>=pagination.pages-2?pagination.pages-4+i:page-2+i;
                return <button key={p} className={`btn btn-sm ${page===p?"btn-primary":"btn-secondary"}`} onClick={()=>setPage(p)}>{p}</button>;
              })}
              <button className="btn btn-secondary btn-sm" onClick={()=>setPage(p=>Math.min(pagination.pages,p+1))} disabled={page===pagination.pages}><ChevronRight size={14}/></button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <AddEmployeeModal
          onClose={()=>setShowModal(false)}
          onSuccess={()=>{ queryClient.invalidateQueries(["employees"]); refetch(); }}
        />
      )}
    </div>
  );
}
