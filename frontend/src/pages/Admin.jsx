import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, LogOut, Plus, Save, Trash2 } from 'lucide-react'
import { fetchAdminCatalog, mutateAdmin } from '../catalog'
import './admin.css'

const emptyProject = {
  slug: '', name: '', type: '', year: String(new Date().getFullYear()), summary: '',
  intro: '', challenge: '', approach: '', outcome: '', scope: '', visualTheme: 'sage',
  visualNote: 'Concept presentation — imagery is illustrative.',
}

const emptyService = { id: '', title: '', description: '', category: 'Platforms & systems' }

function projectToForm(project) {
  return { ...project, scope: (project.scope || []).join(', '), visualTheme: project.visualTheme || project.color || 'sage', visualNote: project.visualNote || project.note || '' }
}

export function Admin() {
  const [key, setKey] = useState(() => sessionStorage.getItem('praxivon_admin_key') || '')
  const [catalog, setCatalog] = useState(null)
  const [loginKey, setLoginKey] = useState('')
  const [tab, setTab] = useState('projects')
  const [project, setProject] = useState(emptyProject)
  const [service, setService] = useState(emptyService)
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)

  const loggedIn = Boolean(catalog && key)
  const projects = catalog?.projects || []
  const services = catalog?.services || []

  async function load(nextKey = key) {
    const data = await fetchAdminCatalog(nextKey)
    setCatalog(data)
  }

  useEffect(() => {
    if (!key) return
    load().catch(() => {
      sessionStorage.removeItem('praxivon_admin_key')
      setKey('')
      setCatalog(null)
    })
  }, [])

  async function login(event) {
    event.preventDefault()
    setMessage('')
    try {
      await load(loginKey)
      sessionStorage.setItem('praxivon_admin_key', loginKey)
      setKey(loginKey)
    } catch (err) {
      setMessage(err.message)
    }
  }

  function logout() {
    sessionStorage.removeItem('praxivon_admin_key')
    setKey('')
    setCatalog(null)
  }

  async function saveProject(event) {
    event.preventDefault()
    setBusy(true)
    setMessage('')
    const { __editing, ...draft } = project
    const payload = { ...draft, scope: project.scope.split(',').map((item) => item.trim()).filter(Boolean) }
    try {
      await mutateAdmin(project.__editing ? `/api/admin/projects/${project.__editing}` : '/api/admin/projects', project.__editing ? 'PUT' : 'POST', key, payload)
      await load()
      setProject(emptyProject)
      setMessage('Project saved.')
    } catch (err) {
      setMessage(err.message)
    } finally { setBusy(false) }
  }

  async function removeProject(slug) {
    if (!window.confirm('Delete this project?')) return
    setBusy(true)
    try { await mutateAdmin(`/api/admin/projects/${slug}`, 'DELETE', key); await load(); setMessage('Project deleted.') }
    catch (err) { setMessage(err.message) }
    finally { setBusy(false) }
  }

  async function saveService(event) {
    event.preventDefault()
    setBusy(true)
    setMessage('')
    try {
      await mutateAdmin(service.__editing ? `/api/admin/services/${service.__editing}` : '/api/admin/services', service.__editing ? 'PUT' : 'POST', key, (() => { const { __editing, ...draft } = service; return draft })())
      await load()
      setService(emptyService)
      setMessage('Service saved.')
    } catch (err) { setMessage(err.message) }
    finally { setBusy(false) }
  }

  async function removeService(id) {
    if (!window.confirm('Delete this service?')) return
    setBusy(true)
    try { await mutateAdmin(`/api/admin/services/${id}`, 'DELETE', key); await load(); setMessage('Service deleted.') }
    catch (err) { setMessage(err.message) }
    finally { setBusy(false) }
  }

  const projectCount = useMemo(() => String(projects.length).padStart(2, '0'), [projects.length])

  if (!loggedIn) {
    return (
      <div className="admin-shell admin-login">
        <div className="admin-login-card">
          <span className="admin-kicker">PRAXIVON / CONTENT</span>
          <h1>Studio admin.</h1>
          <p>Manage the work and services shown on the public site.</p>
          <form onSubmit={login}>
            <label>Admin access key<input type="password" value={loginKey} onChange={(e) => setLoginKey(e.target.value)} autoComplete="current-password" required /></label>
            <button className="admin-primary" type="submit">Open admin <ArrowLeft size={16} style={{ transform: 'rotate(180deg)' }} /></button>
          </form>
          {message && <p className="admin-error">{message}</p>}
          <Link to="/" className="admin-back"><ArrowLeft size={15} /> Back to site</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-shell">
      <header className="admin-header">
        <div><span className="admin-kicker">PRAXIVON / CONTENT</span><h1>Studio admin.</h1></div>
        <div className="admin-actions"><Link to="/" className="admin-ghost">View site <ArrowLeft size={15} style={{ transform: 'rotate(180deg)' }} /></Link><button className="admin-ghost" onClick={logout}><LogOut size={15} /> Sign out</button></div>
      </header>

      <div className="admin-tabs">
        <button className={tab === 'projects' ? 'active' : ''} onClick={() => setTab('projects')}>Projects <span>{projectCount}</span></button>
        <button className={tab === 'services' ? 'active' : ''} onClick={() => setTab('services')}>Services <span>{services.length}</span></button>
      </div>

      {message && <div className="admin-message">{message}</div>}

      {tab === 'projects' ? (
        <div className="admin-grid">
          <section className="admin-panel">
            <div className="admin-panel-head"><div><span className="admin-kicker">{project.__editing ? 'EDIT PROJECT' : 'NEW PROJECT'}</span><h2>{project.__editing ? 'Update the story.' : 'Add new work.'}</h2></div><button className="admin-ghost" onClick={() => setProject(emptyProject)}><Plus size={15} /> New</button></div>
            <form className="admin-form" onSubmit={saveProject}>
              <div className="admin-two"><label>Slug<input value={project.slug} onChange={(e) => setProject({ ...project, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })} required /></label><label>Year<input value={project.year} onChange={(e) => setProject({ ...project, year: e.target.value })} required /></label></div>
              <label>Name<input value={project.name} onChange={(e) => setProject({ ...project, name: e.target.value })} required /></label>
              <label>Type<input value={project.type} onChange={(e) => setProject({ ...project, type: e.target.value })} required /></label>
              <label>Summary<textarea value={project.summary} onChange={(e) => setProject({ ...project, summary: e.target.value })} required /></label>
              <label>Intro<textarea value={project.intro} onChange={(e) => setProject({ ...project, intro: e.target.value })} required /></label>
              <label>Challenge<textarea value={project.challenge} onChange={(e) => setProject({ ...project, challenge: e.target.value })} required /></label>
              <label>Approach<textarea value={project.approach} onChange={(e) => setProject({ ...project, approach: e.target.value })} required /></label>
              <label>Outcome<textarea value={project.outcome} onChange={(e) => setProject({ ...project, outcome: e.target.value })} required /></label>
              <label>Disciplines <small>comma separated</small><input value={project.scope} onChange={(e) => setProject({ ...project, scope: e.target.value })} placeholder="Product strategy, UX design" required /></label>
              <div className="admin-two"><label>Visual theme<input value={project.visualTheme} onChange={(e) => setProject({ ...project, visualTheme: e.target.value })} /></label><label>Visual note<input value={project.visualNote} onChange={(e) => setProject({ ...project, visualNote: e.target.value })} /></label></div>
              <button className="admin-primary" disabled={busy} type="submit"><Save size={16} /> {busy ? 'Saving…' : 'Save project'}</button>
            </form>
          </section>
          <section className="admin-panel">
            <div className="admin-panel-head"><div><span className="admin-kicker">PUBLISHED WORK</span><h2>{projects.length} projects.</h2></div></div>
            <div className="admin-list">{projects.map((item) => <article className="admin-list-item" key={item.slug}><div><strong>{item.name}</strong><span>{item.type} · {item.year}</span></div><div><button onClick={() => setProject({ ...projectToForm(item), __editing: item.slug })}>Edit</button><button className="danger" onClick={() => removeProject(item.slug)}><Trash2 size={15} /></button></div></article>)}</div>
          </section>
        </div>
      ) : (
        <div className="admin-grid">
          <section className="admin-panel">
            <div className="admin-panel-head"><div><span className="admin-kicker">{service.__editing ? 'EDIT SERVICE' : 'NEW SERVICE'}</span><h2>{service.__editing ? 'Update capability.' : 'Add capability.'}</h2></div><button className="admin-ghost" onClick={() => setService(emptyService)}><Plus size={15} /> New</button></div>
            <form className="admin-form" onSubmit={saveService}>
              <label>ID / slug<input value={service.id} onChange={(e) => setService({ ...service, id: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })} required /></label>
              <label>Title<input value={service.title} onChange={(e) => setService({ ...service, title: e.target.value })} required /></label>
              <label>Description<textarea value={service.description} onChange={(e) => setService({ ...service, description: e.target.value })} required /></label>
              <label>Category<select value={service.category} onChange={(e) => setService({ ...service, category: e.target.value })}><option>Web & commerce</option><option>Platforms & systems</option><option>Design & strategy</option><option>Growth & evolution</option></select></label>
              <button className="admin-primary" disabled={busy} type="submit"><Save size={16} /> {busy ? 'Saving…' : 'Save service'}</button>
            </form>
          </section>
          <section className="admin-panel">
            <div className="admin-panel-head"><div><span className="admin-kicker">PUBLISHED CAPABILITIES</span><h2>{services.length} services.</h2></div></div>
            <div className="admin-list">{services.map((item) => <article className="admin-list-item" key={item.id}><div><strong>{item.title}</strong><span>{item.category}</span></div><div><button onClick={() => setService({ ...item, __editing: item.id })}>Edit</button><button className="danger" onClick={() => removeService(item.id)}><Trash2 size={15} /></button></div></article>)}</div>
          </section>
        </div>
      )}
    </div>
  )
}
