import { useState, useRef, useEffect } from 'react';
import { API_URL } from './config';

export default function Admin({ onClose }) {
  const [token, setToken] = useState(null);
  const [loginUser, setLoginUser] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [data, setData] = useState(null);
  const [profile, setProfile] = useState({});
  const [theme, setTheme] = useState({});
  const [project, setProject] = useState({ title: '', description: '', tech: [], link: '', image: '', writeup: '' });
  const [experience, setExperience] = useState({ company: '', role: '', duration: '', description: '' });
  const [newSkill, setNewSkill] = useState('');
  const [message, setMessage] = useState('');
  const skills = profile.skills || data?.skills || [];

  // Always keep a ref to the latest data so Save buttons read fresh state
  const dataRef = useRef(null);
  useEffect(() => { dataRef.current = data; }, [data]);

  async function requestJson(url, options = {}) {
    const res = await fetch(url, options);
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      const error = new Error(body.detail || body.message || 'Request failed');
      error.status = res.status;
      throw error;
    }
    return body;
  }

  function readImageFile(file, field) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setProfile(currentProfile => ({ ...currentProfile, [field]: reader.result }));
    };
    reader.readAsDataURL(file);
  }

  function readProjectImageFile(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setProject(p => ({ ...p, image: reader.result }));
    };
    reader.readAsDataURL(file);
  }

  function readProjectImageFileForEdit(file, index) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const image = reader.result;
      setData(prev => {
        const next = [...prev.projects];
        next[index] = { ...next[index], image };
        return { ...prev, projects: next };
      });
    };
    reader.readAsDataURL(file);
  }

  function updateThemeField(field, value) {
    const nextTheme = { ...theme, [field]: value };
    setTheme(nextTheme);
    window.dispatchEvent(new CustomEvent('portfolio-theme-updated', { detail: { theme: nextTheme } }));
  }

  async function login(e) {
    e.preventDefault();
    setMessage('');
    try {
      const j = await requestJson(`${API_URL}/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: loginUser, password: loginPass })
      });
      if (j.access_token) {
        setToken(j.access_token);
        fetchData(j.access_token);
      }
    } catch (err) {
      setMessage(`Sign in failed: ${err.message}`);
    }
  }

  async function fetchData(authToken = token) {
    if (!authToken) return;
    const j = await requestJson(`${API_URL}/admin/data`, { headers: { Authorization: `Bearer ${authToken}` } });
    setData(j);
    setProfile(j.profile || {});
    setTheme(j.theme || {});
  }

  async function saveProfile(e) {
    e.preventDefault();
    try {
      await requestJson(`${API_URL}/admin/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(profile)
      });
      setMessage('Profile saved.');
      window.dispatchEvent(new Event('portfolio-data-updated'));
      fetchData();
    } catch (err) {
      setMessage(`Profile save failed: ${err.message}`);
    }
  }

  async function saveTheme(e) {
    e.preventDefault();
    try {
      let result;
      try {
        result = await requestJson(`${API_URL}/admin/theme`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(theme)
        });
      } catch (err) {
        if (err.status !== 404) {
          throw err;
        }
        result = await requestJson(`${API_URL}/admin/profile`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ theme })
        });
      }
      const savedTheme = result.theme || theme;
      setTheme(savedTheme);
      setMessage('Theme saved.');
      window.dispatchEvent(new CustomEvent('portfolio-theme-updated', { detail: { theme: savedTheme } }));
      window.dispatchEvent(new Event('portfolio-data-updated'));
      fetchData();
    } catch (err) {
      setMessage(`Theme save failed: ${err.message}`);
    }
  }

  async function addProject(e) {
    e.preventDefault();
    const body = { ...project, tech: project.tech.filter(Boolean) };
    await fetch(`${API_URL}/admin/projects`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(body) });
    setProject({ title: '', description: '', tech: [], link: '', image: '', writeup: '' });
    window.dispatchEvent(new Event('portfolio-data-updated'));
    fetchData();
  }

  async function updateProject(id, proj) {
    try {
      await requestJson(`${API_URL}/admin/projects/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(proj)
      });
      setMessage('Project saved.');
      window.dispatchEvent(new Event('portfolio-data-updated'));
      fetchData();
    } catch (err) {
      setMessage(`Project save failed: ${err.message}`);
    }
  }

  async function deleteProject(id) {
    await fetch(`${API_URL}/admin/projects/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    window.dispatchEvent(new Event('portfolio-data-updated'));
    fetchData();
  }

  async function addExperience(e) {
    e.preventDefault();
    try {
      await requestJson(`${API_URL}/admin/experience`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(experience)
      });
      setExperience({ company: '', role: '', duration: '', description: '' });
      setMessage('Experience added.');
      window.dispatchEvent(new Event('portfolio-data-updated'));
      fetchData();
    } catch (err) {
      setMessage(`Experience add failed: ${err.message}`);
    }
  }

  async function updateExperience(id, nextExperience) {
    try {
      await requestJson(`${API_URL}/admin/experience/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(nextExperience)
      });
      setMessage('Experience saved.');
      window.dispatchEvent(new Event('portfolio-data-updated'));
      fetchData();
    } catch (err) {
      setMessage(`Experience save failed: ${err.message}`);
    }
  }

  async function deleteExperience(id) {
    try {
      await requestJson(`${API_URL}/admin/experience/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      setMessage('Experience deleted.');
      window.dispatchEvent(new Event('portfolio-data-updated'));
      fetchData();
    } catch (err) {
      setMessage(`Experience delete failed: ${err.message}`);
    }
  }

  async function addSkill(e) {
    e.preventDefault();
    if (!newSkill.trim()) return;
    const nextSkills = Array.from(new Set([...skills, newSkill.trim()]));
    await fetch(`${API_URL}/admin/profile`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ skills: nextSkills }) });
    setNewSkill('');
    window.dispatchEvent(new Event('portfolio-data-updated'));
    fetchData();
  }

  async function removeSkill(skillToRemove) {
    const nextSkills = skills.filter(s => s !== skillToRemove);
    await fetch(`${API_URL}/admin/profile`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ skills: nextSkills }) });
    window.dispatchEvent(new Event('portfolio-data-updated'));
    fetchData();
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-start justify-center p-2 md:p-8 z-50 overflow-y-auto overscroll-contain">
      <div className="bg-white text-black rounded-lg w-full max-w-4xl min-h-[100dvh] md:min-h-0 md:max-h-[calc(100vh-4rem)] overflow-y-auto p-4 md:p-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">Admin Panel</h2>
          <div>
            <button onClick={onClose} className="px-3 py-1 border rounded">Close</button>
          </div>
        </div>

        {!token && (
          <form onSubmit={login} className="mt-4 space-y-3">
            {message && (
              <div className="border p-2 text-sm">
                {message}
              </div>
            )}
            <div>
              <label>Username</label>
              <input className="w-full p-3 border text-base" value={loginUser} onChange={e => setLoginUser(e.target.value)} autoComplete="username" />
            </div>
            <div>
              <label>Password</label>
              <input type="password" className="w-full p-3 border text-base" value={loginPass} onChange={e => setLoginPass(e.target.value)} autoComplete="current-password" />
            </div>
            <div>
              <button type="submit" className="w-full md:w-auto px-4 py-3 bg-blue-600 text-white rounded">Sign In</button>
            </div>
          </form>
        )}

        {token && data && (
          <div className="mt-4 space-y-6">
            {message && (
              <div className="border p-2 text-sm">
                {message}
              </div>
            )}

            <section>
              <h3 className="font-bold">Profile</h3>
              <form onSubmit={saveProfile} className="mt-2 space-y-2">
                <input className="w-full p-2 border" value={profile.name || ''} onChange={e => setProfile({ ...profile, name: e.target.value })} placeholder="Name" />
                <input className="w-full p-2 border" value={profile.title || ''} onChange={e => setProfile({ ...profile, title: e.target.value })} placeholder="Title" />
                <input className="w-full p-2 border" value={profile.company || ''} onChange={e => setProfile({ ...profile, company: e.target.value })} placeholder="Company" />
                <input className="w-full p-2 border" value={profile.tagline || ''} onChange={e => setProfile({ ...profile, tagline: e.target.value })} placeholder="Tagline" />
                <input className="w-full p-2 border" value={profile.image || ''} onChange={e => setProfile({ ...profile, image: e.target.value })} placeholder="Profile photo URL" />
                <input className="w-full p-2 border" type="file" accept="image/*" onChange={e => readImageFile(e.target.files?.[0], 'image')} />
                <input className="w-full p-2 border" value={profile.coverImage || ''} onChange={e => setProfile({ ...profile, coverImage: e.target.value })} placeholder="Cover photo URL" />
                <input className="w-full p-2 border" type="file" accept="image/*" onChange={e => readImageFile(e.target.files?.[0], 'coverImage')} />
                <div className="border p-2">
                  <div className="h-28 bg-zinc-200 bg-cover bg-center" style={profile.coverImage ? { backgroundImage: `url(${profile.coverImage})` } : undefined}></div>
                  {profile.image && (
                    <img src={profile.image} alt="Profile preview" className="w-20 h-20 rounded-full object-cover border-4 border-white -mt-10 ml-4 bg-white" />
                  )}
                </div>
                <div>
                  <button className="px-3 py-1 border rounded">Save Profile</button>
                </div>
              </form>
            </section>

            <section>
              <h3 className="font-bold">Theme</h3>
              <form onSubmit={saveTheme} className="mt-2 space-y-3">
                <div className="grid md:grid-cols-3 gap-3">
                  <label className="space-y-1 text-sm">
                    <span>Background</span>
                    <input className="w-full h-11 border" type="color" value={theme.backgroundColor || '#000000'} onChange={e => updateThemeField('backgroundColor', e.target.value)} />
                  </label>
                  <label className="space-y-1 text-sm">
                    <span>Section</span>
                    <input className="w-full h-11 border" type="color" value={theme.sectionColor || '#09090b'} onChange={e => updateThemeField('sectionColor', e.target.value)} />
                  </label>
                  <label className="space-y-1 text-sm">
                    <span>Cards</span>
                    <input className="w-full h-11 border" type="color" value={theme.surfaceColor || '#18181b'} onChange={e => updateThemeField('surfaceColor', e.target.value)} />
                  </label>
                  <label className="space-y-1 text-sm">
                    <span>Text</span>
                    <input className="w-full h-11 border" type="color" value={theme.textColor || '#ffffff'} onChange={e => updateThemeField('textColor', e.target.value)} />
                  </label>
                  <label className="space-y-1 text-sm">
                    <span>Muted Text</span>
                    <input className="w-full h-11 border" type="color" value={theme.mutedTextColor || '#a1a1aa'} onChange={e => updateThemeField('mutedTextColor', e.target.value)} />
                  </label>
                  <label className="space-y-1 text-sm">
                    <span>Accent</span>
                    <input className="w-full h-11 border" type="color" value={theme.accentColor || '#ffffff'} onChange={e => updateThemeField('accentColor', e.target.value)} />
                  </label>
                </div>
                <select className="w-full p-2 border" value={theme.fontFamily || 'Inter, Arial, sans-serif'} onChange={e => updateThemeField('fontFamily', e.target.value)}>
                  <option value="Inter, Arial, sans-serif">Inter / Arial</option>
                  <option value="Georgia, serif">Georgia</option>
                  <option value="'Times New Roman', serif">Times New Roman</option>
                  <option value="'Courier New', monospace">Courier New</option>
                  <option value="Verdana, Geneva, sans-serif">Verdana</option>
                </select>
                <label className="block text-sm">
                  <span>Button Radius: {theme.buttonRadius || '12'}px</span>
                  <input className="w-full" type="range" min="0" max="28" value={theme.buttonRadius || '12'} onChange={e => updateThemeField('buttonRadius', e.target.value)} />
                </label>
                <div>
                  <button type="submit" className="px-3 py-1 border rounded bg-blue-600 text-white">Save Theme</button>
                </div>
              </form>
            </section>

            <section>
              <h3 className="font-bold">Experience</h3>
              <form onSubmit={addExperience} className="mt-2 space-y-2">
                <input className="w-full p-2 border" value={experience.role} onChange={e => setExperience({ ...experience, role: e.target.value })} placeholder="Role" required />
                <input className="w-full p-2 border" value={experience.company} onChange={e => setExperience({ ...experience, company: e.target.value })} placeholder="Company" required />
                <input className="w-full p-2 border" value={experience.duration} onChange={e => setExperience({ ...experience, duration: e.target.value })} placeholder="Duration" required />
                <textarea className="w-full p-2 border" value={experience.description} onChange={e => setExperience({ ...experience, description: e.target.value })} placeholder="Description" required />
                <div>
                  <button type="submit" className="px-3 py-1 border rounded bg-blue-600 text-white">Add Experience</button>
                </div>
              </form>

              <div className="mt-3 space-y-3">
                {(data.experience || []).map((item, index) => (
                  <form
                    key={item.id || index}
                    onSubmit={e => {
                      e.preventDefault();
                      updateExperience(item.id, item);
                    }}
                    className="border p-3 space-y-2"
                  >
                    <input className="w-full p-2 border" value={item.role || ''} onChange={e => {
                      const nextExperience = [...(data.experience || [])];
                      nextExperience[index] = { ...item, role: e.target.value };
                      setData({ ...data, experience: nextExperience });
                    }} placeholder="Role" required />
                    <input className="w-full p-2 border" value={item.company || ''} onChange={e => {
                      const nextExperience = [...(data.experience || [])];
                      nextExperience[index] = { ...item, company: e.target.value };
                      setData({ ...data, experience: nextExperience });
                    }} placeholder="Company" required />
                    <input className="w-full p-2 border" value={item.duration || ''} onChange={e => {
                      const nextExperience = [...(data.experience || [])];
                      nextExperience[index] = { ...item, duration: e.target.value };
                      setData({ ...data, experience: nextExperience });
                    }} placeholder="Duration" required />
                    <textarea className="w-full p-2 border" value={item.description || ''} onChange={e => {
                      const nextExperience = [...(data.experience || [])];
                      nextExperience[index] = { ...item, description: e.target.value };
                      setData({ ...data, experience: nextExperience });
                    }} placeholder="Description" required />
                    <div className="flex gap-2">
                      <button type="submit" className="px-3 py-1 border rounded bg-blue-600 text-white">Save</button>
                      <button type="button" onClick={() => deleteExperience(item.id)} className="px-3 py-1 border rounded">Delete</button>
                    </div>
                  </form>
                ))}
              </div>
            </section>

            <section>
              <h3 className="font-bold">Projects</h3>
              <form onSubmit={addProject} className="mt-2 space-y-2">
                <input className="w-full p-2 border" value={project.title} onChange={e => setProject({ ...project, title: e.target.value })} placeholder="Title" required />
                <textarea className="w-full p-2 border" value={project.description} onChange={e => setProject({ ...project, description: e.target.value })} placeholder="Short description (shown on card)" required />
                <input className="w-full p-2 border" value={project.tech.join(',')} onChange={e => setProject({ ...project, tech: e.target.value.split(',').map(t => t.trim()).filter(Boolean) })} placeholder="Tech (comma separated)" />
                <input className="w-full p-2 border" value={project.link} onChange={e => setProject({ ...project, link: e.target.value })} placeholder="External link (optional)" />
                <div>
                  <label className="text-sm font-medium block mb-1">Project Image</label>
                  <input className="w-full p-2 border" type="file" accept="image/*" onChange={e => readProjectImageFile(e.target.files?.[0])} />
                  {project.image && <img src={project.image} alt="Preview" className="mt-1 h-24 object-cover rounded border" />}
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Write-up (shown in popup)</label>
                  <textarea className="w-full p-2 border" rows={4} value={project.writeup} onChange={e => setProject({ ...project, writeup: e.target.value })} placeholder="Detailed write-up about the project..." />
                </div>
                <div>
                  <button type="submit" className="px-3 py-1 border rounded bg-blue-600 text-white">Add Project</button>
                </div>
              </form>

              <div className="mt-3 space-y-3">
                {(data.projects || []).map((p, index) => (
                  <div
                    key={p.id}
                    className="border p-3 space-y-2"
                  >
                    <input className="w-full p-2 border" value={p.title || ''} onChange={e => {
                      const val = e.target.value;
                      setData(prev => { const next = [...prev.projects]; next[index] = { ...next[index], title: val }; return { ...prev, projects: next }; });
                    }} placeholder="Title" />
                    <textarea className="w-full p-2 border" value={p.description || ''} onChange={e => {
                      const val = e.target.value;
                      setData(prev => { const next = [...prev.projects]; next[index] = { ...next[index], description: val }; return { ...prev, projects: next }; });
                    }} placeholder="Short description" />
                    <input className="w-full p-2 border" value={(p.tech || []).join(',')} onChange={e => {
                      const val = e.target.value.split(',').map(t => t.trim()).filter(Boolean);
                      setData(prev => { const next = [...prev.projects]; next[index] = { ...next[index], tech: val }; return { ...prev, projects: next }; });
                    }} placeholder="Tech (comma separated)" />
                    <input className="w-full p-2 border" value={p.link || ''} onChange={e => {
                      const val = e.target.value;
                      setData(prev => { const next = [...prev.projects]; next[index] = { ...next[index], link: val }; return { ...prev, projects: next }; });
                    }} placeholder="External link (optional)" />
                    <div>
                      <label className="text-sm font-medium block mb-1">Project Image</label>
                      <input className="w-full p-2 border" type="file" accept="image/*" onChange={e => {
                        const file = e.target.files?.[0];
                        if (file && file.size > 400000) {
                          setMessage('Warning: Image is large (' + Math.round(file.size / 1024) + 'KB). Consider compressing it below 400KB to ensure it saves correctly on the server.');
                        }
                        readProjectImageFileForEdit(file, index);
                      }} />
                      {p.image && <img src={p.image} alt="Preview" className="mt-1 h-24 object-cover rounded border" />}
                    </div>
                    <div>
                      <label className="text-sm font-medium block mb-1">Write-up (shown in popup)</label>
                      <textarea className="w-full p-2 border" rows={4} value={p.writeup || ''} onChange={e => {
                        const val = e.target.value;
                        setData(prev => { const next = [...prev.projects]; next[index] = { ...next[index], writeup: val }; return { ...prev, projects: next }; });
                      }} placeholder="Detailed write-up about the project..." />
                    </div>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => {
                        const latest = (dataRef.current?.projects || data?.projects || []).find(proj => proj.id === p.id);
                        updateProject(p.id, latest || p);
                      }} className="px-3 py-1 border rounded bg-blue-600 text-white">Save</button>
                      <button type="button" onClick={() => deleteProject(p.id)} className="px-3 py-1 border rounded">Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h3 className="font-bold">Skills</h3>
              <div className="mt-2">
                <form onSubmit={addSkill} className="flex gap-2 mb-4">
                  <input className="p-2 border flex-1" value={newSkill} onChange={e => setNewSkill(e.target.value)} placeholder="New skill" />
                  <button type="submit" className="px-3 py-1 border rounded bg-blue-600 text-white">Add</button>
                </form>
                <div className="flex flex-wrap gap-2">
                  {skills.map(s => (
                    <div key={s} className="px-2 py-1 border rounded flex items-center gap-2">
                      <span>{s}</span>
                      <button onClick={() => removeSkill(s)} className="text-red-600 font-bold cursor-pointer hover:text-red-800">×</button>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section>
              <h3 className="font-bold">Contacts</h3>
              <div className="mt-2">
                {(data.contacts || []).map(c => (
                  <div key={c.id} className="border p-2 my-1">
                    <div className="font-bold">{c.name} &lt;{c.email}&gt;</div>
                    <div className="text-sm">{c.message}</div>
                    <div className="text-xs text-gray-600">{c.received_at}</div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
