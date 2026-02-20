import React, { useState, useEffect, createContext, useContext } from 'react';
import axios from 'axios';
import './App.css';

// ─── Theme Context ────────────────────────────────────
const ThemeContext = createContext();
export const useTheme = () => useContext(ThemeContext);

// ─── API base ────────────────────────────────────────
const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// ─── Utility ─────────────────────────────────────────
function formatDate(dateStr) {
  if (!dateStr) return 'Present';
  const [year, month] = dateStr.split('-');
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${months[parseInt(month) - 1]} ${year}`;
}

// ─── Icons ────────────────────────────────────────────
const icons = {
  github: () => <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/></svg>,
  linkedin: () => <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>,
  twitter: () => <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>,
  location: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>,
  mail: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
  edit: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  check: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="16" height="16"><polyline points="20 6 9 17 4 12"/></svg>,
  x: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  plus: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  sun: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>,
  moon: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>,
  ai: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12"/></svg>,
  thumb: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><path d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3H14z"/><path d="M7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3"/></svg>,
  briefcase: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/></svg>,
  link: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>,
};

// ─── Skill Badge ─────────────────────────────────────
function SkillBadge({ skill, editMode, onEndorse }) {
  const [showEndorseModal, setShowEndorseModal] = useState(false);
  const [endorserName, setEndorserName] = useState('');
  const [endorsing, setEndorsing] = useState(false);
  const [endorsed, setEndorsed] = useState(false);

  async function handleEndorse() {
    if (!endorserName.trim()) return;
    setEndorsing(true);
    try {
      await axios.post(`${API}/api/skills/${skill.id}/endorse`, { endorser_name: endorserName });
      setEndorsed(true);
      onEndorse(skill.id);
      setTimeout(() => { setShowEndorseModal(false); setEndorsed(false); setEndorserName(''); }, 1500);
    } catch (e) { console.error(e); }
    setEndorsing(false);
  }

  const categoryColors = {
    Frontend: 'skill-frontend', Backend: 'skill-backend',
    Database: 'skill-database', DevOps: 'skill-devops', Design: 'skill-design',
  };

  return (
    <div className={`skill-badge ${categoryColors[skill.category] || 'skill-frontend'}`}>
      <span className="skill-name">{skill.name}</span>
      <span className="skill-count">{skill.endorsements}</span>
      {!editMode && (
        <button className="endorse-btn" onClick={() => setShowEndorseModal(true)} title="Endorse this skill">
          <icons.thumb />
        </button>
      )}
      {showEndorseModal && (
        <div className="endorse-modal-overlay" onClick={() => setShowEndorseModal(false)}>
          <div className="endorse-modal" onClick={e => e.stopPropagation()}>
            {endorsed ? (
              <div className="endorse-success">
                <icons.check /> Endorsed!
              </div>
            ) : (
              <>
                <h4>Endorse "{skill.name}"</h4>
                <input
                  placeholder="Your name"
                  value={endorserName}
                  onChange={e => setEndorserName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleEndorse()}
                  autoFocus
                />
                <div className="endorse-actions">
                  <button className="btn-ghost" onClick={() => setShowEndorseModal(false)}>Cancel</button>
                  <button className="btn-primary" onClick={handleEndorse} disabled={endorsing || !endorserName.trim()}>
                    {endorsing ? 'Endorsing...' : 'Endorse'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── AI Bio Generator ─────────────────────────────────
function AIBioGenerator({ profile, onApply }) {
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState('');

  async function generate() {
    setLoading(true);
    setGenerated('');
    // Call backend which calls Claude
    try {
      const res = await axios.post(`${API}/api/profile/${profile.id}/generate-bio`, {
        name: profile.name,
        title: profile.title,
        skills: profile.skills?.map(s => s.name).join(', '),
        location: profile.location,
      });
      setGenerated(res.data.bio);
    } catch {
      // Fallback: generate locally
      const skillsList = profile.skills?.slice(0, 5).map(s => s.name).join(', ') || 'various technologies';
      setGenerated(
        `${profile.name} is a ${profile.title} based in ${profile.location}, specializing in ${skillsList}. ` +
        `With a passion for building user-centric applications, they bring both technical depth and design sensibility to every project. ` +
        `Always curious about the latest in AI and web development, they continuously push the boundaries of what's possible.`
      );
    }
    setLoading(false);
  }

  return (
    <div className="ai-bio-generator">
      <div className="ai-bio-header">
        <icons.ai /> <span>AI Bio Generator</span>
      </div>
      {generated && (
        <div className="ai-bio-result">
          <p>{generated}</p>
          <button className="btn-primary btn-sm" onClick={() => onApply(generated)}>
            <icons.check /> Use this bio
          </button>
        </div>
      )}
      <button className="btn-ai" onClick={generate} disabled={loading}>
        {loading ? <span className="spinner" /> : <icons.ai />}
        {loading ? 'Generating...' : 'Generate Bio with AI'}
      </button>
    </div>
  );
}

// ─── Work Timeline ────────────────────────────────────
function WorkTimeline({ timeline }) {
  return (
    <div className="timeline">
      {timeline.map((item, i) => (
        <div key={i} className={`timeline-item ${item.current ? 'current' : ''}`}>
          <div className="timeline-dot" />
          <div className="timeline-connector" />
          <div className="timeline-content">
            <div className="timeline-header">
              <div>
                <h4 className="timeline-role">{item.role}</h4>
                <div className="timeline-company">
                  <icons.briefcase />
                  <span>{item.company}</span>
                  {item.current && <span className="current-badge">Current</span>}
                </div>
              </div>
              <span className="timeline-dates">
                {formatDate(item.start_date)} – {item.end_date ? formatDate(item.end_date) : 'Present'}
              </span>
            </div>
            {item.description && <p className="timeline-desc">{item.description}</p>}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Edit Modal ──────────────────────────────────────
function EditModal({ profile, onSave, onClose }) {
  const [form, setForm] = useState({
    name: profile.name || '',
    title: profile.title || '',
    bio: profile.bio || '',
    location: profile.location || '',
    email: profile.email || '',
    website: profile.website || '',
    open_to_work: profile.open_to_work || 0,
    social_links: profile.social_links || [],
    skills: profile.skills || [],
    work_timeline: profile.work_timeline || [],
    projects: profile.projects || [],
  });
  const [tab, setTab] = useState('basics');
  const [saving, setSaving] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  const [aiMode, setAiMode] = useState(false);

  function updateSocial(platform, value) {
    const existing = form.social_links.find(s => s.platform === platform);
    if (existing) {
      setForm(f => ({ ...f, social_links: f.social_links.map(s => s.platform === platform ? { ...s, url: value } : s) }));
    } else {
      setForm(f => ({ ...f, social_links: [...f.social_links, { platform, url: value }] }));
    }
  }

  function getSocialUrl(platform) {
    return form.social_links.find(s => s.platform === platform)?.url || '';
  }

  function addSkill() {
    if (!newSkill.trim()) return;
    setForm(f => ({ ...f, skills: [...f.skills, { name: newSkill.trim(), category: 'Technical', endorsements: 0 }] }));
    setNewSkill('');
  }

  function removeSkill(name) {
    setForm(f => ({ ...f, skills: f.skills.filter(s => s.name !== name) }));
  }

  async function handleSave() {
    setSaving(true);
    await onSave(form);
    setSaving(false);
    onClose();
  }

  const tabs = ['basics', 'social', 'skills', 'experience'];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Edit Profile</h2>
          <button className="icon-btn" onClick={onClose}><icons.x /></button>
        </div>

        <div className="modal-tabs">
          {tabs.map(t => (
            <button key={t} className={`modal-tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        <div className="modal-body">
          {tab === 'basics' && (
            <div className="form-group-list">
              <div className="form-group">
                <label>Full Name</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="form-group">
                <label>Title / Role</label>
                <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
              </div>
              <div className="form-group">
                <label>Location</label>
                <input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
              </div>
              <div className="form-group">
                <label>Website</label>
                <input value={form.website} onChange={e => setForm(f => ({ ...f, website: e.target.value }))} />
              </div>
              <div className="form-group">
                <label>Bio</label>
                {aiMode && (
                  <AIBioGenerator profile={profile} onApply={(bio) => {
                    setForm(f => ({ ...f, bio }));
                    setAiMode(false);
                  }} />
                )}
                <textarea rows={4} value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} />
                <button className="btn-link" onClick={() => setAiMode(!aiMode)}>
                  <icons.ai /> {aiMode ? 'Write manually' : 'Generate with AI'}
                </button>
              </div>
              <div className="form-group toggle-group">
                <label>Open to Work</label>
                <label className="toggle">
                  <input type="checkbox" checked={!!form.open_to_work} onChange={e => setForm(f => ({ ...f, open_to_work: e.target.checked ? 1 : 0 }))} />
                  <span className="toggle-slider" />
                </label>
              </div>
            </div>
          )}

          {tab === 'social' && (
            <div className="form-group-list">
              {['github', 'linkedin', 'twitter'].map(platform => (
                <div key={platform} className="form-group">
                  <label style={{ textTransform: 'capitalize' }}>{platform}</label>
                  <input placeholder={`https://${platform}.com/...`} value={getSocialUrl(platform)} onChange={e => updateSocial(platform, e.target.value)} />
                </div>
              ))}
            </div>
          )}

          {tab === 'skills' && (
            <div className="form-group-list">
              <div className="form-group">
                <label>Skills</label>
                <div className="skill-input-row">
                  <input placeholder="Add a skill..." value={newSkill} onChange={e => setNewSkill(e.target.value)} onKeyDown={e => e.key === 'Enter' && addSkill()} />
                  <button className="btn-primary btn-sm" onClick={addSkill}><icons.plus /> Add</button>
                </div>
                <div className="skills-edit-list">
                  {form.skills.map(s => (
                    <div key={s.name} className="skill-edit-item">
                      <span>{s.name}</span>
                      <button className="icon-btn-sm" onClick={() => removeSkill(s.name)}><icons.x /></button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {tab === 'experience' && (
            <div className="form-group-list">
              {form.work_timeline.map((w, i) => (
                <div key={i} className="experience-edit-item">
                  <div className="form-row">
                    <div className="form-group">
                      <label>Company</label>
                      <input value={w.company} onChange={e => setForm(f => ({
                        ...f, work_timeline: f.work_timeline.map((x, j) => j === i ? { ...x, company: e.target.value } : x)
                      }))} />
                    </div>
                    <div className="form-group">
                      <label>Role</label>
                      <input value={w.role} onChange={e => setForm(f => ({
                        ...f, work_timeline: f.work_timeline.map((x, j) => j === i ? { ...x, role: e.target.value } : x)
                      }))} />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Start (YYYY-MM)</label>
                      <input value={w.start_date} onChange={e => setForm(f => ({
                        ...f, work_timeline: f.work_timeline.map((x, j) => j === i ? { ...x, start_date: e.target.value } : x)
                      }))} />
                    </div>
                    <div className="form-group">
                      <label>End (YYYY-MM or blank)</label>
                      <input value={w.end_date || ''} onChange={e => setForm(f => ({
                        ...f, work_timeline: f.work_timeline.map((x, j) => j === i ? { ...x, end_date: e.target.value || null } : x)
                      }))} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Description</label>
                    <textarea rows={2} value={w.description || ''} onChange={e => setForm(f => ({
                      ...f, work_timeline: f.work_timeline.map((x, j) => j === i ? { ...x, description: e.target.value } : x)
                    }))} />
                  </div>
                  <button className="btn-ghost btn-sm danger" onClick={() => setForm(f => ({ ...f, work_timeline: f.work_timeline.filter((_, j) => j !== i) }))}>
                    Remove
                  </button>
                </div>
              ))}
              <button className="btn-ghost btn-sm" onClick={() => setForm(f => ({
                ...f, work_timeline: [...f.work_timeline, { company: '', role: '', start_date: '', end_date: null, description: '', current: 0 }]
              }))}>
                <icons.plus /> Add Experience
              </button>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : <><icons.check /> Save Changes</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────
export default function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    try {
      const res = await axios.get(`${API}/api/profile/1`);
      setProfile(res.data);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }

  async function handleSave(form) {
    await axios.put(`${API}/api/profile/1`, form);
    await fetchProfile();
  }

  function handleEndorse(skillId) {
    setProfile(p => ({
      ...p,
      skills: p.skills.map(s => s.id === skillId ? { ...s, endorsements: s.endorsements + 1 } : s)
    }));
  }

  if (loading) return (
    <div className="loading-screen">
      <div className="loading-logo">G</div>
      <div className="loading-dots"><span/><span/><span/></div>
    </div>
  );

  if (!profile) return <div className="error-screen">Failed to load profile.</div>;

  const socialIcons = { github: icons.github, linkedin: icons.linkedin, twitter: icons.twitter };
  const tabs = ['overview', 'experience', 'projects'];

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <div className="app">
        {/* Header */}
        <header className="header">
          <div className="header-logo">
            <span className="logo-icon">G</span>
            <span className="logo-text">idy</span>
          </div>
          <div className="header-actions">
            <button className="icon-btn theme-toggle" onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')} title="Toggle theme">
              {theme === 'dark' ? <icons.sun /> : <icons.moon />}
            </button>
            <button className="btn-primary" onClick={() => setEditOpen(true)}>
              <icons.edit /> Edit Profile
            </button>
          </div>
        </header>

        {/* Cover */}
        <div className="cover-section">
          <div className="cover-bg">
            <div className="cover-gradient" />
            <div className="cover-pattern" />
          </div>
        </div>

        {/* Profile Main */}
        <main className="profile-main">
          <div className="profile-card">
            {/* Avatar */}
            <div className="avatar-wrapper">
              <div className="avatar">
                {profile.avatar
                  ? <img src={`${API}${profile.avatar}`} alt={profile.name} />
                  : <span className="avatar-initials">{profile.name.split(' ').map(w => w[0]).join('')}</span>
                }
              </div>
              {profile.open_to_work ? <div className="open-badge">Open to Work</div> : null}
            </div>

            {/* Info */}
            <div className="profile-info">
              <div className="profile-top">
                <div>
                  <h1 className="profile-name">{profile.name}</h1>
                  <p className="profile-title">{profile.title}</p>
                  <div className="profile-meta">
                    {profile.location && <span className="meta-item"><icons.location />{profile.location}</span>}
                    {profile.email && <span className="meta-item"><icons.mail />{profile.email}</span>}
                  </div>
                </div>
                <div className="profile-stats">
                  <div className="stat"><span className="stat-value">{profile.followers?.toLocaleString()}</span><span className="stat-label">Followers</span></div>
                  <div className="stat-divider" />
                  <div className="stat"><span className="stat-value">{profile.following?.toLocaleString()}</span><span className="stat-label">Following</span></div>
                </div>
              </div>

              <p className="profile-bio">{profile.bio}</p>

              {/* Social Links */}
              {profile.social_links?.length > 0 && (
                <div className="social-links">
                  {profile.social_links.map(({ platform, url }) => {
                    const Icon = socialIcons[platform];
                    return Icon ? (
                      <a key={platform} href={url} target="_blank" rel="noopener noreferrer" className="social-link" title={platform}>
                        <Icon />
                      </a>
                    ) : null;
                  })}
                  {profile.website && (
                    <a href={profile.website} target="_blank" rel="noopener noreferrer" className="social-link website-link">
                      <icons.link /> Website
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="tabs-nav">
            {tabs.map(t => (
              <button key={t} className={`tab-btn ${activeTab === t ? 'active' : ''}`} onClick={() => setActiveTab(t)}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="tab-content">
            {activeTab === 'overview' && (
              <div className="overview-grid">
                {/* Skills */}
                <div className="card skills-card">
                  <h3 className="card-title">Skills & Expertise</h3>
                  <p className="card-subtitle">Click the thumbs up icon to endorse a skill</p>
                  <div className="skills-grid">
                    {profile.skills?.map(skill => (
                      <SkillBadge key={skill.id} skill={skill} onEndorse={handleEndorse} />
                    ))}
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="card quick-stats-card">
                  <h3 className="card-title">Quick Stats</h3>
                  <div className="quick-stats">
                    <div className="qs-item">
                      <span className="qs-val">{profile.skills?.length}</span>
                      <span className="qs-label">Skills</span>
                    </div>
                    <div className="qs-item">
                      <span className="qs-val">{profile.work_timeline?.length}</span>
                      <span className="qs-label">Roles</span>
                    </div>
                    <div className="qs-item">
                      <span className="qs-val">{profile.projects?.length}</span>
                      <span className="qs-label">Projects</span>
                    </div>
                    <div className="qs-item">
                      <span className="qs-val">{profile.skills?.reduce((a, s) => a + s.endorsements, 0)}</span>
                      <span className="qs-label">Endorsements</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'experience' && (
              <div className="card">
                <h3 className="card-title">Work Experience</h3>
                {profile.work_timeline?.length > 0
                  ? <WorkTimeline timeline={profile.work_timeline} />
                  : <p className="empty-state">No experience added yet.</p>
                }
              </div>
            )}

            {activeTab === 'projects' && (
              <div className="projects-grid">
                {profile.projects?.map((p, i) => (
                  <div key={i} className="project-card">
                    <h4 className="project-title">{p.title}</h4>
                    <p className="project-desc">{p.description}</p>
                    <div className="project-tags">
                      {p.tags?.split(',').map(tag => (
                        <span key={tag} className="tag">{tag.trim()}</span>
                      ))}
                    </div>
                    {p.url && (
                      <a href={p.url} target="_blank" rel="noopener noreferrer" className="project-link">
                        <icons.link /> View Project
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>

        {editOpen && <EditModal profile={profile} onSave={handleSave} onClose={() => setEditOpen(false)} />}
      </div>
    </ThemeContext.Provider>
  );
}
