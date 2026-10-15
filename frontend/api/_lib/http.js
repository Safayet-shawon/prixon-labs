import { createHash } from 'node:crypto'

export class HttpError extends Error {
  constructor(status, message) {
    super(message)
    this.status = status
  }
}

export function send(res, status, body, headers = {}) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.setHeader('X-Content-Type-Options', 'nosniff')
  for (const [k, v] of Object.entries(headers)) res.setHeader(k, v)
  res.end(body === undefined ? '' : JSON.stringify(body))
}

// JSON response with a strong ETag so repeat visitors get a cheap 304 and the
// Vercel edge CDN can serve stale content while it revalidates.
export function sendCached(req, res, body, cacheControl) {
  const text = JSON.stringify(body)
  const etag = `"${createHash('sha1').update(text).digest('base64url')}"`
  res.setHeader('ETag', etag)
  res.setHeader('Cache-Control', cacheControl)
  res.setHeader('Vary', 'Accept-Encoding')
  if (req.headers['if-none-match'] === etag) {
    res.statusCode = 304
    return res.end()
  }
  res.statusCode = 200
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.end(text)
}

export const clientIp = (req) =>
  String(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown')
    .split(',')[0]
    .trim()

// Best-effort in-memory limiter. It protects a warm instance from bursts; use
// Vercel Firewall rate limiting for hard guarantees.
const buckets = new Map()
export function rateLimit(key, limit, windowMs) {
  const now = Date.now()
  const hits = (buckets.get(key) || []).filter((t) => now - t < windowMs)
  if (hits.length >= limit) {
    buckets.set(key, hits)
    throw new HttpError(429, 'Too many requests. Please wait a moment and try again.')
  }
  hits.push(now)
  buckets.set(key, hits)
  if (buckets.size > 5000) {
    for (const [k, v] of buckets)
      if (!v.length || now - v[v.length - 1] > windowMs) buckets.delete(k)
  }
}

export function applyCors(req, res) {
  const allowed = (process.env.CORS_ORIGINS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
  const origin = req.headers.origin
  if (origin && allowed.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin)
    res.setHeader('Vary', 'Origin')
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,X-Praxivon-Admin,If-None-Match')
    res.setHeader('Access-Control-Max-Age', '86400')
  }
}
