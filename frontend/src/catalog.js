import { useEffect, useState } from 'react'
import { projects as fallbackProjects, services as fallbackServices } from './data'

const base = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '')
let cache = null
let request = null

async function loadCatalog() {
  if (cache) return cache
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
      if (!Array.isArray(data.services) || !Array.isArray(data.projects)) throw new Error('Invalid catalog')
      cache = data
      return data
    })
    .catch(() => ({ services: fallbackServices, projects: fallbackProjects }))
    .finally(() => {
      clearTimeout(timer)
      request = null
    })
  return request
}

export function useCatalog() {
  const [catalog, setCatalog] = useState(() => cache || { services: fallbackServices, projects: fallbackProjects })
  useEffect(() => {
    let active = true
    loadCatalog().then((next) => { if (active) setCatalog(next) })
    return () => { active = false }
  }, [])
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
    headers: { 'Content-Type': 'application/json', Accept: 'application/json', 'X-Praxivon-Admin': key },
    body: body ? JSON.stringify(body) : undefined,
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.message || 'The change could not be saved.')
  cache = null
  return data
}
