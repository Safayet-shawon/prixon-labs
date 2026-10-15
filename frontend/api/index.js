// One serverless function serves the whole REST API. vercel.json rewrites every
// /api/* request to /api?__path=<rest>, which keeps the project well inside the
// Hobby plan function limit and keeps caches warm together.
import { timingSafeEqual } from 'node:crypto'
import { HttpError, applyCors, clientIp, rateLimit, send, sendCached } from './_lib/http.js'
import * as store from './_lib/store.js'
import { handleContact } from './_lib/contact.js'
import { MatrixError } from '../src/lib/matrix.js'
import { SCENARIOS } from '../src/lib/scenarios.js'

const CATALOG_CACHE = 'public, max-age=30, s-maxage=60, stale-while-revalidate=600'

function adminAllowed(req) {
  const expected = Buffer.from(process.env.ADMIN_PASSWORD || '')
  const provided = Buffer.from(String(req.headers['x-praxivon-admin'] || ''))
  if (!expected.length || expected.length !== provided.length) return false
  return timingSafeEqual(expected, provided)
}

// Expensive scenario results are memoised: identical inputs are common while
// someone drags a slider back and forth.
const matrixCache = new Map()
function runScenario(kind, input) {
  const fn = SCENARIOS[kind]
  if (!fn) throw new HttpError(404, 'Unknown scenario.')
  const cacheKey = `${kind}:${JSON.stringify(input ?? {})}`
  if (matrixCache.has(cacheKey)) return matrixCache.get(cacheKey)
  let result
  try {
    result = fn(input ?? {})
  } catch (error) {
    if (error instanceof MatrixError) throw new HttpError(400, error.message)
    throw error
  }
  matrixCache.set(cacheKey, result)
  if (matrixCache.size > 200) matrixCache.delete(matrixCache.keys().next().value)
  return result
}

async function route(req, res, segments) {
  const method = req.method
  const [a, b, c] = segments

  if (a === 'health' && method === 'GET') {
    return send(
      res,
      200,
      { status: 'ok', database: store.dbConfigured() ? 'supabase' : 'bundled-seed' },
      { 'Cache-Control': 'no-store' },
    )
  }

  if (a === 'catalog' && method === 'GET') {
    const { services, projects } = await store.getCatalog()
    return sendCached(req, res, { services, projects }, CATALOG_CACHE)
  }

  if (a === 'services' && !b && method === 'GET') {
    return sendCached(req, res, (await store.getCatalog()).services, CATALOG_CACHE)
  }

  if (a === 'projects' && method === 'GET') {
    const { projects } = await store.getCatalog()
    if (b) {
      const found = projects.find((p) => p.slug === b)
      if (!found) throw new HttpError(404, 'Project not found.')
      return sendCached(req, res, found, CATALOG_CACHE)
    }
    const url = new URL(req.url, 'http://localhost')
    const q = (url.searchParams.get('q') || '').toLowerCase().trim()
    const limit = Math.min(Math.max(parseInt(url.searchParams.get('limit') || '0', 10) || 0, 0), 50)
    const offset = Math.max(parseInt(url.searchParams.get('offset') || '0', 10) || 0, 0)
    const filtered = q
      ? projects.filter((p) =>
          [p.name, p.type, p.summary, p.intro, ...p.scope].join(' ').toLowerCase().includes(q),
        )
      : projects
    // Without ?limit the response stays a plain array for older clients.
    if (!limit) return sendCached(req, res, filtered, CATALOG_CACHE)
    return sendCached(
      req,
      res,
      { total: filtered.length, items: filtered.slice(offset, offset + limit) },
      CATALOG_CACHE,
    )
  }

  if (a === 'contact' && method === 'POST') {
    rateLimit(`contact:${clientIp(req)}`, 5, 10 * 60_000)
    await handleContact(req.body)
    return send(
      res,
      202,
      { message: 'Your message has been sent.' },
      { 'Cache-Control': 'no-store' },
    )
  }

  if (a === 'matrix' && method === 'POST') {
    rateLimit(`matrix:${clientIp(req)}`, 120, 60_000)
    const result = runScenario(b || req.body?.kind, req.body?.input ?? req.body)
    return send(res, 200, result, { 'Cache-Control': 'no-store' })
  }

  if (a === 'admin') {
    rateLimit(`admin:${clientIp(req)}`, 60, 60_000)
    if (!adminAllowed(req)) throw new HttpError(401, 'Admin access denied.')
    if (b === 'catalog' && method === 'GET') {
      store.invalidate()
      return send(res, 200, await store.getCatalog(), { 'Cache-Control': 'no-store' })
    }
    const kinds = {
      services: ['createService', 'updateService', 'deleteService'],
      projects: ['createProject', 'updateProject', 'deleteProject'],
    }
    const ops = kinds[b]
    if (ops) {
      if (!c && method === 'POST')
        return send(res, 201, await store[ops[0]](req.body), { 'Cache-Control': 'no-store' })
      if (c && method === 'PUT')
        return send(res, 200, await store[ops[1]](c, req.body), { 'Cache-Control': 'no-store' })
      if (c && method === 'DELETE') {
        await store[ops[2]](c)
        return send(res, 204, undefined)
      }
    }
  }

  throw new HttpError(404, 'Not found.')
}

export default async function handler(req, res) {
  applyCors(req, res)
  if (req.method === 'OPTIONS') {
    res.statusCode = 204
    return res.end()
  }
  try {
    const url = new URL(req.url, 'http://localhost')
    const rewritten = url.searchParams.get('__path')
    const rest = rewritten ?? url.pathname.replace(/^\/api\/?/, '')
    const segments = rest
      .split('/')
      .filter(Boolean)
      .map((part) => {
        try {
          return decodeURIComponent(part)
        } catch {
          throw new HttpError(400, 'Malformed request path.')
        }
      })
    await route(req, res, segments)
  } catch (error) {
    if (error instanceof HttpError)
      return send(res, error.status, { message: error.message }, { 'Cache-Control': 'no-store' })
    console.error('API error', error)
    send(
      res,
      500,
      { message: 'Something went wrong on our side.' },
      { 'Cache-Control': 'no-store' },
    )
  }
}
