import { useState } from 'react';
import { API_URL } from './config';

export default function Admin({ onClose }) {
  const [token, setToken] = useState(null);
  const [loginUser, setLoginUser] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [data, setData] = useState(null);
  const [profile, setProfile] = useState({});
  const [project, setProject] = useState({ title: '', description: '', tech: [], link: '' });
  const [newSkill, setNewSkill] = useState('');
  const skills = profile.skills || data?.skills || [];

  async function login(e) {
    e.preventDefault();
    const res = await fetch(`${API_URL}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: loginUser, password: loginPass })
    });
    const j = await res.json();
    if (j.access_token) {
      setToken(j.access_token);
      fetchData(j.access_token);
    }
  }

  async function fetchData(authToken = token) {
    if (!authToken) return;
    const res = await fetch(`${API_URL}/admin/data`, { headers: { Authorization: `Bearer ${authToken}` } });
    const j = await res.json();
    setData(j);
    setProfile(j.profile || {});
  }

  async function saveProfile(e) {
    e.preventDefault();
    await fetch(`${API_URL}/admin/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(profile)
    });
    window.dispatchEvent(new Event('portfolio-data-updated'));
    fetchData();
  }

  async function addProject(e) {
    e.preventDefault();
    const body = { ...project, tech: project.tech.filter(Boolean) };
    await fetch(`${API_URL}/admin/projects`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(body) });
    setProject({ title: '', description: '', tech: [], link: '' });
    window.dispatchEvent(new Event('portfolio-data-updated'));
    fetchData();
  }

  async function deleteProject(id) {
    await fetch(`${API_URL}/admin/projects/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    window.dispatchEvent(new Event('portfolio-data-updated'));
    fetchData();
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
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-start justify-center p-8 z-50">
      <div className="bg-white text-black rounded-lg w-full max-w-4xl p-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">Admin Panel</h2>
          <div>
            <button onClick={onClose} className="px-3 py-1 border rounded">Close</button>
          </div>
        </div>

        {!token && (
          <form onSubmit={login} className="mt-4">
            <div>
              <label>Username</label>
              <input className="w-full p-2 border" value={loginUser} onChange={e => setLoginUser(e.target.value)} />
            </div>
            <div className="mt-2">
              <label>Password</label>
              <input type="password" className="w-full p-2 border" value={loginPass} onChange={e => setLoginPass(e.target.value)} />
            </div>
            <div className="mt-4">
              <button className="px-4 py-2 bg-blue-600 text-white rounded">Sign In</button>
            </div>
          </form>
        )}

        {token && data && (
          <div className="mt-4 space-y-6">
            <section>
              <h3 className="font-bold">Profile</h3>
              <form onSubmit={saveProfile} className="mt-2 space-y-2">
                <input className="w-full p-2 border" value={profile.name || ''} onChange={e => setProfile({ ...profile, name: e.target.value })} placeholder="Name" />
                <input className="w-full p-2 border" value={profile.title || ''} onChange={e => setProfile({ ...profile, title: e.target.value })} placeholder="Title" />
                <input className="w-full p-2 border" value={profile.company || ''} onChange={e => setProfile({ ...profile, company: e.target.value })} placeholder="Company" />
                <input className="w-full p-2 border" value={profile.tagline || ''} onChange={e => setProfile({ ...profile, tagline: e.target.value })} placeholder="Tagline" />
                <div>
                  <button className="px-3 py-1 border rounded">Save Profile</button>
                </div>
              </form>
            </section>

            <section>
              <h3 className="font-bold">Projects</h3>
              <form onSubmit={addProject} className="mt-2 space-y-2">
                <input className="w-full p-2 border" value={project.title} onChange={e => setProject({ ...project, title: e.target.value })} placeholder="Title" required />
                <textarea className="w-full p-2 border" value={project.description} onChange={e => setProject({ ...project, description: e.target.value })} placeholder="Description" required />
                <input className="w-full p-2 border" value={project.tech.join(',')} onChange={e => setProject({ ...project, tech: e.target.value.split(',').map(t => t.trim()).filter(Boolean) })} placeholder="Tech (comma separated)" />
                <input className="w-full p-2 border" value={project.link} onChange={e => setProject({ ...project, link: e.target.value })} placeholder="Link" />
                <div>
                  <button type="submit" className="px-3 py-1 border rounded bg-blue-600 text-white">Add Project</button>
                </div>
              </form>

              <div className="mt-3">
                {(data.projects || []).map(p => (
                  <div key={p.id} className="border p-2 my-2 flex justify-between">
                    <div>
                      <div className="font-bold">{p.title}</div>
                      <div className="text-sm">{p.description}</div>
                    </div>
                    <div>
                      <button onClick={() => deleteProject(p.id)} className="px-2 py-1 border rounded">Delete</button>
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
