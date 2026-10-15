# Praxivon Labs

An independent digital product studio site: a fast React frontend, a Vercel serverless API backed by Supabase (Postgres), and an optional Spring Boot API for self-hosting.

**Live:** https://praxivonlabs.vercel.app

## What is in the box

| Path                 | What it is                                                                     |
| -------------------- | ------------------------------------------------------------------------------ |
| `frontend/`          | React 19 + Vite 7 + Tailwind 4 site, plus the serverless API in `frontend/api` |
| `frontend/api/`      | One Vercel function (`[...path].js`) serving the whole REST API                |
| `supabase/`          | SQL migration (`migrations/0001_init.sql`) and generated `seed.sql`            |
| `backend/`           | Optional Java 17 / Spring Boot API (same routes, same database)                |
| `docker-compose.yml` | nginx load balancer + 2 API replicas + static site                             |

## Features

- **Sector concept projects** across manufacturing, healthcare, real estate, logistics, hospitality, education, commerce and more, each with a case study page.
- **Solution Lab** (`/lab`): working tools built on matrix mathematics, verified by the API:
  - _Sales pipeline forecast_ — absorbing Markov chain, `(I − Q)⁻¹`, win rate, time to close, expected revenue.
  - _Stock & materials planner_ — multi-level bill of materials as a Leontief system, netted level by level against stock.
  - _Decision matrix_ — weighted scoring to compare options fairly.
- **Admin panel** (`/admin`): add, edit and delete projects and services, stored in Supabase.
- **Contact form**: validated server-side, stored in Supabase, optional e-mail notification through Resend.
- **Button styles**: Clay, Glass and Fabric, switchable from the footer and remembered per visitor.

## Quick start

Needs Node 20+.

```bash
npm --prefix frontend ci
npm run dev
```

Open http://127.0.0.1:5173. In development Vite serves the same API as production, so `/lab`, `/work` and the catalog work with no extra setup. Without Supabase credentials the API serves the bundled catalog and refuses to fake contact-form success.

### Connect Supabase

1. Create a project at https://supabase.com.
2. Open the SQL editor and run `supabase/migrations/0001_init.sql`, then `supabase/seed.sql`.
3. Copy `frontend/.env.example` to `frontend/.env.local` and set `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` and `ADMIN_PASSWORD`.
4. In Vercel, add the same three variables (Project → Settings → Environment Variables) and redeploy.

The service-role key is server-only. Never prefix it with `VITE_`, and never commit it. Row Level Security is enabled: the public can read the catalog, and only the server can write it or read enquiries.

To reseed from `frontend/src/data.js`: `npm --prefix frontend run db:seed` (REST) or `npm --prefix frontend run db:seed-sql` (rewrites `supabase/seed.sql`).

## API

All routes live under `/api`.

| Method              | Path                                          | Purpose                                             |
| ------------------- | --------------------------------------------- | --------------------------------------------------- |
| GET                 | `/api/health`                                 | Health and data source                              |
| GET                 | `/api/catalog`                                | Services + projects (CDN cached, ETag)              |
| GET                 | `/api/services`                               | Services                                            |
| GET                 | `/api/projects?q=&limit=&offset=`             | Projects; with `limit` returns `{ total, items }`   |
| GET                 | `/api/projects/{slug}`                        | One project                                         |
| POST                | `/api/contact`                                | Validated enquiry                                   |
| POST                | `/api/matrix/{pipeline, inventory, decision}` | Matrix scenarios (memoised)                         |
| GET/POST/PUT/DELETE | `/api/admin/...`                              | Content management, needs `X-Praxivon-Admin` header |

## Performance

- Route-level code splitting plus vendor chunks (`react`, `router`, `motion`, `three`); the 3D scene loads only near the viewport.
- Fonts load without blocking first paint; images are WebP with explicit dimensions.
- Catalog: stale-while-revalidate in `localStorage` on the client, ETag + `s-maxage` + `stale-while-revalidate` on the CDN, 30 s in-memory cache on the server.
- Skeleton screens while routes load; route chunks are prefetched on hover.
- Debounced search and slider handlers, paginated project list, memoised cards.
- Database indexes, RLS, and PostgREST (pooled by Supabase) from serverless functions; HikariCP pooling in the Java API.
- Gzip/Brotli on Vercel, compression enabled in nginx and Spring Boot.
- Audit it yourself: `npm --prefix frontend run lighthouse -- https://praxivonlabs.vercel.app`.

## Self-hosting with Docker

```bash
cp .env.docker.example .env      # fill in Supabase pooler DB_URL, credentials, ADMIN_PASSWORD
docker compose up --build        # http://localhost:8080
```

nginx serves the site, caches catalog reads, and load-balances `/api` across two Spring Boot replicas. The Java API seeds five projects into an empty database; if you already ran `supabase/seed.sql` it serves all of them.

## Checks

```bash
npm run verify        # lint, tests, format check, production build
```

Backend (needs Java 17): `cd backend && ./mvnw verify`. GitHub Actions runs everything, including Docker image builds, on every push.

## Notes

- Project artwork and case studies are illustrative **concept** work; they are labelled as such. Replace them with approved client work when available.
- `hello@praxivon.com` is unverified. Confirm or replace it before launch.
