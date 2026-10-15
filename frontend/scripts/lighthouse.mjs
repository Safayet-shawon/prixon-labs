// Runs a Lighthouse audit against a URL (default: the production site) and
// prints the category scores. Usage: npm run lighthouse -- https://example.com
import { spawnSync } from 'node:child_process'

const url = process.argv[2] || 'https://praxivon-labs-studio.vercel.app'
const args = [
  '--yes',
  'lighthouse',
  url,
  '--output=json',
  '--output-path=stdout',
  '--quiet',
  '--chrome-flags=--headless=new --no-sandbox',
  '--only-categories=performance,accessibility,best-practices,seo',
]
const run = spawnSync('npx', args, { encoding: 'utf8', shell: true, maxBuffer: 64 * 1024 * 1024 })
if (run.status !== 0) {
  console.error(run.stderr || 'Lighthouse failed. Is Chrome installed?')
  process.exit(1)
}
const { categories, audits } = JSON.parse(run.stdout)
for (const c of Object.values(categories))
  console.log(`${c.title.padEnd(16)} ${Math.round(c.score * 100)}`)
for (const id of [
  'first-contentful-paint',
  'largest-contentful-paint',
  'total-blocking-time',
  'cumulative-layout-shift',
])
  console.log(`${audits[id].title.padEnd(28)} ${audits[id].displayValue}`)
