import { seedProjects, seedServices } from './seed.js'
import { HttpError } from './http.js'

const TTL_MS = 30_000
let cache = null

const url = () => (process.env.SUPABASE_URL || '').replace(/\/+$/, '')
const key = () => process.env.SUPABASE_SERVICE_ROLE_KEY || ''
export const dbConfigured = () => Boolean(url() && key())

// Supabase exposes Postgres through PostgREST (Supavisor-pooled on their side),
// so serverless invocations never open raw database connections.
async function rest(path, { method = 'GET', body, prefer } = {}) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 6000)
  try {
    const response = await fetch(`${url()}/rest/v1/${path}`, {
      method,
      signal: controller.signal,
      headers: {
        apikey: key(),
        Authorization: `Bearer ${key()}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...(prefer ? { Prefer: prefer } : {}),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    })
    const raw = await response.text()
    const data = raw ? JSON.parse(raw) : null
    if (!response.ok) {
      if (response.status === 409 || data?.code === '23505')
        throw new HttpError(409, 'That identifier already exists.')
      throw new HttpError(502, 'The database request failed.')
    }
    return data
  } catch (error) {
    if (error instanceof HttpError) throw error
    throw new HttpError(502, 'The database is temporarily unavailable.')
  } finally {
    clearTimeout(timer)
  }
}

const fromServiceRow = (r) => ({
  id: r.id,
  title: r.title,
  description: r.description,
  category: r.category,
})
const fromProjectRow = (r) => ({
  slug: r.slug,
  name: r.name,
  type: r.type,
  year: r.year,
  summary: r.summary,
  intro: r.intro,
  challenge: r.challenge,
  approach: r.approach,
  outcome: r.outcome,
  scope: String(r.scope || '')
    .split('|')
    .filter(Boolean),
  visualTheme: r.visual_theme,
  visualNote: r.visual_note,
})
const toProjectRow = (p) => ({
  slug: p.slug,
  name: p.name,
  type: p.type,
  year: p.year,
  summary: p.summary,
  intro: p.intro,
  challenge: p.challenge,
  approach: p.approach,
  outcome: p.outcome,
  scope: p.scope.join('|'),
  visual_theme: p.visualTheme,
  visual_note: p.visualNote,
})

export async function getCatalog() {
  if (cache && Date.now() - cache.at < TTL_MS) return cache.value
  let value
  if (dbConfigured()) {
    try {
      const [services, projects] = await Promise.all([
        rest('services?select=*&order=sort_order.asc,id.asc'),
        rest('projects?select=*&order=sort_order.asc,slug.asc'),
      ])
      value = { services: services.map(fromServiceRow), projects: projects.map(fromProjectRow) }
    } catch {
      // Never take the public site down because the database blinked.
      if (cache) return cache.value
      value = { services: seedServices, projects: seedProjects }
    }
  } else {
    value = { services: seedServices, projects: seedProjects }
  }
  cache = { value, at: Date.now() }
  return value
}

export const invalidate = () => {
  cache = null
}

function requireDb() {
  if (!dbConfigured())
    throw new HttpError(
      503,
      'The database is not configured yet. Connect Supabase to enable editing.',
    )
}

async function nextOrder(table) {
  const rows = await rest(`${table}?select=sort_order&order=sort_order.desc&limit=1`)
  return (rows[0]?.sort_order || 0) + 1
}

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const text = (v, label, max) => {
  if (typeof v !== 'string' || !v.trim()) throw new HttpError(400, `${label} is required.`)
  if (v.length > max) throw new HttpError(400, `${label} is too long.`)
  return v.trim()
}

export function validateService(s) {
  if (!s || typeof s !== 'object') throw new HttpError(400, 'Invalid service.')
  if (typeof s.id !== 'string' || !SLUG.test(s.id))
    throw new HttpError(400, 'Service id must be lowercase slug format.')
  return {
    id: s.id,
    title: text(s.title, 'Service title', 160),
    description: text(s.description, 'Service description', 1000),
    category: text(s.category, 'Service category', 120),
  }
}

export function validateProject(p) {
  if (!p || typeof p !== 'object') throw new HttpError(400, 'Invalid project.')
  if (typeof p.slug !== 'string' || !SLUG.test(p.slug))
    throw new HttpError(400, 'Project slug must be lowercase slug format.')
  const scope = Array.isArray(p.scope) ? p.scope.map((s) => String(s).trim()).filter(Boolean) : []
  if (!scope.length) throw new HttpError(400, 'At least one project discipline is required.')
  if (scope.some((s) => s.includes('|')))
    throw new HttpError(400, 'Disciplines cannot contain the | character.')
  return {
    slug: p.slug,
    name: text(p.name, 'Project name', 160),
    type: text(p.type, 'Project type', 160),
    year: text(String(p.year ?? ''), 'Year', 20),
    summary: text(p.summary, 'Summary', 1000),
    intro: text(p.intro, 'Intro', 2000),
    challenge: text(p.challenge, 'Challenge', 4000),
    approach: text(p.approach, 'Approach', 4000),
    outcome: text(p.outcome, 'Outcome', 4000),
    scope,
    visualTheme: text(p.visualTheme, 'Visual theme', 80),
    visualNote: text(p.visualNote, 'Visual note', 500),
  }
}

export async function createService(input) {
  requireDb()
  const s = validateService(input)
  const rows = await rest('services', {
    method: 'POST',
    prefer: 'return=representation',
    body: { ...s, sort_order: await nextOrder('services') },
  })
  invalidate()
  return fromServiceRow(rows[0])
}

export async function updateService(id, input) {
  requireDb()
  const s = validateService(input)
  const rows = await rest(`services?id=eq.${encodeURIComponent(id)}`, {
    method: 'PATCH',
    prefer: 'return=representation',
    body: s,
  })
  if (!rows.length) throw new HttpError(404, 'Service not found.')
  invalidate()
  return fromServiceRow(rows[0])
}

export async function deleteService(id) {
  requireDb()
  const rows = await rest(`services?id=eq.${encodeURIComponent(id)}`, {
    method: 'DELETE',
    prefer: 'return=representation',
  })
  if (!rows.length) throw new HttpError(404, 'Service not found.')
  invalidate()
}

export async function createProject(input) {
  requireDb()
  const p = validateProject(input)
  const rows = await rest('projects', {
    method: 'POST',
    prefer: 'return=representation',
    body: { ...toProjectRow(p), sort_order: await nextOrder('projects') },
  })
  invalidate()
  return fromProjectRow(rows[0])
}

export async function updateProject(slug, input) {
  requireDb()
  const p = validateProject(input)
  const rows = await rest(`projects?slug=eq.${encodeURIComponent(slug)}`, {
    method: 'PATCH',
    prefer: 'return=representation',
    body: toProjectRow(p),
  })
  if (!rows.length) throw new HttpError(404, 'Project not found.')
  invalidate()
  return fromProjectRow(rows[0])
}

export async function deleteProject(slug) {
  requireDb()
  const rows = await rest(`projects?slug=eq.${encodeURIComponent(slug)}`, {
    method: 'DELETE',
    prefer: 'return=representation',
  })
  if (!rows.length) throw new HttpError(404, 'Project not found.')
  invalidate()
}

export async function saveEnquiry(e) {
  if (!dbConfigured())
    throw new HttpError(
      503,
      'Our contact service is not available right now. Please email us directly.',
    )
  await rest('enquiries', {
    method: 'POST',
    body: {
      name: e.name,
      email: e.email || null,
      phone: e.phone || null,
      company: e.company || null,
      service: e.service,
      message: e.message,
    },
  })
}
