// Seed + offline fallback. The single source of truth is src/data.js so the
// site, the API and the Supabase seed script can never drift apart.
import { projects, services } from '../../src/data.js'

const slugify = (value) =>
  value
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

export const seedServices = services.map((s) => ({
  id: s.id || slugify(s.title),
  title: s.title,
  description: s.short,
  category: s.category,
}))

export const seedProjects = projects.map((p) => ({
  slug: p.slug,
  name: p.name,
  type: p.type,
  year: p.year,
  summary: p.summary,
  intro: p.intro,
  challenge: p.challenge,
  approach: p.approach,
  outcome: p.outcome,
  scope: p.scope,
  visualTheme: p.color,
  visualNote: p.note,
}))
