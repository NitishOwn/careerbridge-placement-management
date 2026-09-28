import React, { useEffect, useMemo, useState } from 'react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5001';

async function api(path, options = {}) {
  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

function App() {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('cb_user') || 'null'));
  const [token, setToken] = useState(() => localStorage.getItem('cb_token') || '');
  const [page, setPage] = useState('jobs');
  const [notice, setNotice] = useState('');

  const login = (data) => {
    setToken(data.token); setUser(data.user);
    localStorage.setItem('cb_token', data.token); localStorage.setItem('cb_user', JSON.stringify(data.user));
    setPage(data.user.role === 'recruiter' ? 'recruiter' : 'jobs');
  };
  const logout = () => { setToken(''); setUser(null); localStorage.clear(); setPage('jobs'); };
  const flash = (msg) => { setNotice(msg); setTimeout(() => setNotice(''), 3500); };

  return <div className="app">
    <Header user={user} page={page} setPage={setPage} logout={logout} />
    {notice && <div className="toast">{notice}</div>}
    <main className="container">
      {!user && page === 'auth' ? <Auth onLogin={login} /> :
       !user && page !== 'jobs' ? <Auth onLogin={login} /> :
       page === 'jobs' ? <Jobs user={user} token={token} onLogin={() => setPage('auth')} flash={flash} /> :
       page === 'applications' ? <Applications token={token} /> :
       page === 'recruiter' && user?.role === 'recruiter' ? <Recruiter token={token} flash={flash} /> :
       page === 'auth' ? <Auth onLogin={login} /> : <Jobs user={user} token={token} onLogin={() => setPage('auth')} flash={flash} />}
    </main>
    <footer>CareerBridge · Placement & Recruitment Management System</footer>
  </div>;
}

function Header({ user, page, setPage, logout }) {
  return <header className="header"><div className="nav container">
    <button className="brand" onClick={() => setPage('jobs')}><span>CB</span> CareerBridge</button>
    <nav>
      <button className={page === 'jobs' ? 'active' : ''} onClick={() => setPage('jobs')}>Jobs</button>
      {user?.role === 'student' && <button className={page === 'applications' ? 'active' : ''} onClick={() => setPage('applications')}>My Applications</button>}
      {user?.role === 'recruiter' && <button className={page === 'recruiter' ? 'active' : ''} onClick={() => setPage('recruiter')}>Recruiter Dashboard</button>}
    </nav>
    <div className="account">{user ? <><span className="user">{user.name} · {user.role}</span><button className="outline" onClick={logout}>Logout</button></> : <button className="primary small" onClick={() => setPage('auth')}>Login / Register</button>}</div>
  </div></header>;
}

function Auth({ onLogin }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name:'', email:'', password:'', role:'student' });
  const [error, setError] = useState(''); const [loading, setLoading] = useState(false);
  const submit = async (e) => { e.preventDefault(); setError(''); setLoading(true);
    try {
      if (mode === 'register') await api('/api/auth/register', { method:'POST', body:JSON.stringify(form) });
      const data = await api('/api/auth/login', { method:'POST', body:JSON.stringify({ email:form.email, password:form.password }) });
      onLogin(data);
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  };
  return <section className="auth-wrap"><div className="auth-card">
    <div className="eyebrow">CAREERBRIDGE</div><h1>{mode === 'login' ? 'Welcome back' : 'Create your account'}</h1><p className="muted">{mode === 'login' ? 'Login to continue your placement journey.' : 'Join students and recruiters on one platform.'}</p>
    <form onSubmit={submit}>
      {mode === 'register' && <label>Name<input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required /></label>}
      <label>Email<input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} required /></label>
      <label>Password<input type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} minLength="8" required /></label>
      {mode === 'register' && <label>Account type<select value={form.role} onChange={e=>setForm({...form,role:e.target.value})}><option value="student">Student</option><option value="recruiter">Recruiter</option></select></label>}
      {error && <div className="error">{error}</div>}
      <button className="primary wide" disabled={loading}>{loading ? 'Please wait...' : mode === 'login' ? 'Login' : 'Create account'}</button>
    </form>
    <button className="link-btn" onClick={()=>{setMode(mode==='login'?'register':'login');setError('')}}>{mode==='login' ? 'New here? Create an account' : 'Already registered? Login'}</button>
  </div></section>;
}

function Jobs({ user, token, onLogin, flash }) {
  const [q,setQ]=useState(''); const [jobs,setJobs]=useState([]); const [loading,setLoading]=useState(true); const [error,setError]=useState('');
  const load = async () => { setLoading(true); try { const data=await api(`/api/jobs?q=${encodeURIComponent(q)}`); setJobs(data.jobs || []); setError(''); } catch(e){setError(e.message)} finally{setLoading(false)} };
  useEffect(()=>{load()},[]);
  const apply = async (id) => { if(!user){onLogin();return;} if(user.role!=='student'){flash('Only student accounts can apply to jobs.');return;} try {await api(`/api/jobs/${id}/apply`,{method:'POST',headers:{Authorization:`Bearer ${token}`}});flash('Application submitted successfully.');} catch(e){flash(e.message)} };
  return <section><div className="hero"><div><div className="eyebrow">YOUR NEXT OPPORTUNITY</div><h1>Find a role that moves your career forward.</h1><p>Discover internships and jobs, apply in seconds, and track your applications.</p></div><div className="hero-stat"><strong>{jobs.length}</strong><span>latest jobs</span></div></div>
    <div className="toolbar"><input placeholder="Search by job title or company..." value={q} onChange={e=>setQ(e.target.value)} onKeyDown={e=>e.key==='Enter'&&load()} /><button className="primary" onClick={load}>Search</button></div>
    {loading?<div className="empty">Loading jobs...</div>:error?<div className="error">{error}</div>:jobs.length===0?<div className="empty">No jobs found.</div>:<div className="job-grid">{jobs.map(j=><article className="job-card" key={j._id}><div className="job-top"><div className="company-icon">{j.company?.[0]?.toUpperCase() || 'C'}</div><div><h3>{j.title}</h3><p>{j.company}</p></div></div><div className="tags"><span>{j.location}</span><span>Full-time / Internship</span></div><p className="desc">{j.description}</p><div className="job-footer"><small>{new Date(j.createdAt).toLocaleDateString()}</small><button className="primary" onClick={()=>apply(j._id)}>{user?.role==='student'?'Apply now':'View opportunity'}</button></div></article>)}</div>}
  </section>;
}

function Applications({ token }) {
  const [items,setItems]=useState([]); const [loading,setLoading]=useState(true); const [error,setError]=useState('');
  useEffect(()=>{api('/api/applications/mine',{headers:{Authorization:`Bearer ${token}`}}).then(setItems).catch(e=>setError(e.message)).finally(()=>setLoading(false))},[token]);
  return <section><div className="section-head"><div><div className="eyebrow">STUDENT</div><h1>My Applications</h1></div></div>{loading?<div className="empty">Loading...</div>:error?<div className="error">{error}</div>:items.length===0?<div className="empty">You haven't applied to any jobs yet.</div>:<div className="table-card"><table><thead><tr><th>Role</th><th>Company</th><th>Location</th><th>Status</th></tr></thead><tbody>{items.map(a=><tr key={a._id}><td>{a.job?.title}</td><td>{a.job?.company}</td><td>{a.job?.location}</td><td><span className={`status ${a.status}`}>{a.status}</span></td></tr>)}</tbody></table></div>}</section>;
}

function Recruiter({ token, flash }) {
  const [jobs,setJobs]=useState([]); const [selected,setSelected]=useState(null); const [apps,setApps]=useState([]); const [form,setForm]=useState({title:'',company:'',location:'',description:''}); const [loading,setLoading]=useState(false);
  const loadJobs=()=>api('/api/jobs').then(d=>setJobs(d.jobs||[])); useEffect(()=>{loadJobs()},[]);
  const create=async e=>{e.preventDefault();setLoading(true);try{await api('/api/jobs',{method:'POST',headers:{Authorization:`Bearer ${token}`},body:JSON.stringify(form)});setForm({title:'',company:'',location:'',description:''});flash('Job created successfully.');loadJobs()}catch(e){flash(e.message)}finally{setLoading(false)}};
  const viewApps=async id=>{setSelected(id);try{const d=await api(`/api/jobs/${id}/applications`,{headers:{Authorization:`Bearer ${token}`}});setApps(d)}catch(e){flash(e.message)}};
  const updateStatus=async(id,status)=>{try{await api(`/api/applications/${id}/status`,{method:'PATCH',headers:{Authorization:`Bearer ${token}`},body:JSON.stringify({status})});if(selected)viewApps(selected);flash('Application status updated.')}catch(e){flash(e.message)}};
  return <section><div className="section-head"><div><div className="eyebrow">RECRUITER</div><h1>Recruiter Dashboard</h1></div></div><div className="dashboard-grid"><div className="panel"><h2>Post a new job</h2><form onSubmit={create}><label>Job title<input value={form.title} onChange={e=>setForm({...form,title:e.target.value})} required /></label><label>Company<input value={form.company} onChange={e=>setForm({...form,company:e.target.value})} required /></label><label>Location<input value={form.location} onChange={e=>setForm({...form,location:e.target.value})} required /></label><label>Description<textarea rows="5" value={form.description} onChange={e=>setForm({...form,description:e.target.value})} required /></label><button className="primary wide" disabled={loading}>{loading?'Creating...':'Publish job'}</button></form></div><div className="panel"><h2>Recent jobs</h2>{jobs.length===0?<div className="empty small-empty">No jobs yet.</div>:jobs.map(j=><div className="mini-job" key={j._id}><div><strong>{j.title}</strong><span>{j.company} · {j.location}</span></div><button className="outline" onClick={()=>viewApps(j._id)}>Applicants</button></div>)}</div></div>{selected&&<div className="panel applicants"><div className="panel-head"><h2>Applicants</h2><button className="link-btn" onClick={()=>setSelected(null)}>Close</button></div>{apps.length===0?<div className="empty small-empty">No applicants yet.</div>:apps.map(a=><div className="app-row" key={a._id}><div><strong>{a.student?.name}</strong><span>{a.student?.email}</span></div><div className="row-actions"><span className={`status ${a.status}`}>{a.status}</span>{a.status==='applied'&&<><button className="outline" onClick={()=>updateStatus(a._id,'reviewing')}>Review</button><button className="primary" onClick={()=>updateStatus(a._id,'shortlisted')}>Shortlist</button><button className="danger" onClick={()=>updateStatus(a._id,'rejected')}>Reject</button></>}</div></div>)}</div>}</section>;
}

export default App;
