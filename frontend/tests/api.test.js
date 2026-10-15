import assert from 'node:assert/strict'
import test from 'node:test'
import handler from '../api/[...path].js'

delete process.env.SUPABASE_URL
delete process.env.SUPABASE_SERVICE_ROLE_KEY
process.env.ADMIN_PASSWORD = 'test-admin-secret'

function call(method, url, { body, headers = {} } = {}) {
  return new Promise((resolve, reject) => {
    const res = {
      statusCode: 200,
      headers: {},
      setHeader(k, v) {
        this.headers[k.toLowerCase()] = v
      },
      end(payload) {
        resolve({
          status: this.statusCode,
          headers: this.headers,
          json: payload ? JSON.parse(payload) : null,
        })
      },
    }
    const req = {
      method,
      url,
      body,
      headers: { 'x-forwarded-for': `10.0.0.${Math.floor(Math.random() * 250)}`, ...headers },
      socket: {},
    }
    handler(req, res).catch(reject)
  })
}

test('health reports the bundled seed when Supabase is not configured', async () => {
  const r = await call('GET', '/api/health')
  assert.equal(r.status, 200)
  assert.equal(r.json.database, 'bundled-seed')
})

test('catalog is served with CDN cache headers and an ETag that yields 304', async () => {
  const r = await call('GET', '/api/catalog')
  assert.equal(r.status, 200)
  assert.equal(r.json.projects.length, 10)
  assert.equal(r.json.services.length, 11)
  assert.match(r.headers['cache-control'], /s-maxage=60/)
  const again = await call('GET', '/api/catalog', { headers: { 'if-none-match': r.headers.etag } })
  assert.equal(again.status, 304)
})

test('projects support search and pagination', async () => {
  const page = await call('GET', '/api/projects?limit=4&offset=4')
  assert.equal(page.json.total, 10)
  assert.equal(page.json.items.length, 4)
  const search = await call('GET', '/api/projects?q=garment&limit=10')
  assert.ok(search.json.items.length >= 1)
  assert.equal((await call('GET', '/api/projects/nope')).status, 404)
})

test('contact validates input and refuses to fake success without a database', async () => {
  const bad = await call('POST', '/api/contact', { body: { name: 'A' } })
  assert.equal(bad.status, 400)
  const good = {
    name: 'Rahim',
    email: 'rahim@example.com',
    service: 'CRM systems',
    message: 'We need a CRM for our sales team.',
  }
  const unavailable = await call('POST', '/api/contact', { body: good })
  assert.equal(unavailable.status, 503)
  const bot = await call('POST', '/api/contact', { body: { ...good, website: 'spam.example' } })
  assert.equal(bot.status, 202)
})

test('matrix endpoint computes scenarios and rejects bad input', async () => {
  const forecast = await call('POST', '/api/matrix/pipeline', { body: {} })
  assert.equal(forecast.status, 200)
  assert.ok(Math.abs(forecast.json.winRate - 0.3457) < 1e-4)
  const plan = await call('POST', '/api/matrix/inventory', { body: {} })
  assert.deepEqual(plan.json.net, [460, 720, 388, 38])
  const bad = await call('POST', '/api/matrix/inventory', {
    body: {
      items: ['a', 'b'],
      requirements: [
        [1.5, 0],
        [0, 0],
      ],
      demand: [1, 0],
      stock: [0, 0],
    },
  })
  assert.equal(bad.status, 400)
})

test('admin routes require the secret and report an unconfigured database', async () => {
  assert.equal((await call('GET', '/api/admin/catalog')).status, 401)
  assert.equal(
    (
      await call('GET', '/api/admin/catalog', {
        headers: { 'x-praxivon-admin': 'wrong-secret-here' },
      })
    ).status,
    401,
  )
  const ok = await call('GET', '/api/admin/catalog', {
    headers: { 'x-praxivon-admin': 'test-admin-secret' },
  })
  assert.equal(ok.status, 200)
  const write = await call('POST', '/api/admin/services', {
    headers: { 'x-praxivon-admin': 'test-admin-secret' },
    body: { id: 'x-y', title: 'T', description: 'D', category: 'C' },
  })
  assert.equal(write.status, 503)
})
