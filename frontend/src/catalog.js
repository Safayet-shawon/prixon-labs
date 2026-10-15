import { useEffect, useState } from 'react'
import { projects as fallbackProjects, services as fallbackServices } from './data'

const base = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '')
const STORAGE_KEY = 'praxivon:catalog:v2'
const FRESH_MS = 5 * 60 * 1000

const fallback = { services: fallbackServices, projects: fallbackProjects }
let memory = null
let request = null

function normalize(data) {
  return {
    services: data.services.map((item, index) => ({
      ...item,
      number: item.number || String(index + 1).padStart(2, '0'),
      short: item.short || item.description,
      icon: item.icon || '↗',
    })),
    projects: data.projects.map((item, index) => ({
      ...item,
      number: item.number || String(index + 1).padStart(2, '0'),
      color: item.color || item.visualTheme || 'sage',
      note: item.note || item.visualNote || '',
    })),
  }
}

function readStored() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null')
    if (raw && Array.isArray(raw.data?.services) && Array.isArray(raw.data?.projects)) return raw
  } catch {
    /* storage unavailable or corrupt: ignore */
  }
  return null
}

function writeStored(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ at: Date.now(), data }))
  } catch {
    /* quota or privacy mode: ignore */
  }
}

// Stale-while-revalidate: show the last known catalog instantly (memory, then
// localStorage), refresh from the API in the background, and always fall back
// to the bundled catalog so a slow API never blocks rendering.
function fetchCatalog() {
  if (request) return request
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 3500)
  request = fetch(`${base}/api/catalog`, {
    headers: { Accept: 'application/json' },
    signal: controller.signal,
  })
    .then(async (response) => {
      if (!response.ok) throw new Error('Catalog unavailable')
      const data = await response.json()
      if (!Array.isArray(data.services) || !Array.isArray(data.projects))
        throw new Error('Invalid catalog')
      const normalized = normalize(data)
      memory = normalized
      writeStored(normalized)
      return normalized
    })
    .catch(() => memory || fallback)
    .finally(() => {
      clearTimeout(timer)
      request = null
    })
  return request
}

function initialCatalog() {
  if (memory) return { catalog: memory, fresh: true }
  const stored = readStored()
  if (stored) {
    memory = stored.data
    return { catalog: memory, fresh: Date.now() - stored.at < FRESH_MS }
  }
  return { catalog: fallback, fresh: false }
}

export function useCatalog() {
  const [state] = useState(initialCatalog)
  const [catalog, setCatalog] = useState(state.catalog)
  useEffect(() => {
    if (state.fresh) return undefined
    let active = true
    fetchCatalog().then((next) => {
      if (active) setCatalog(next)
    })
    return () => {
      active = false
    }
  }, [state.fresh])
  return catalog
}

export async function fetchAdminCatalog(key) {
  const response = await fetch(`${base}/api/admin/catalog`, {
    headers: { Accept: 'application/json', 'X-Praxivon-Admin': key },
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.message || 'Admin access failed.')
  return data
}

export async function mutateAdmin(path, method, key, body) {
  const response = await fetch(`${base}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'X-Praxivon-Admin': key,
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.message || 'The change could not be saved.')
  memory = null
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    /* ignore */
  }
  return data
}
