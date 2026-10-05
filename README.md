# Praxivon Labs

An independent digital product studio portfolio with a React frontend and Java/Spring Boot content API.

## Stack

- `frontend/` — React 19, Vite 7, Tailwind CSS 4, React Router, Framer Motion, Lucide
- `backend/` — Java 17, Spring Boot 4.1, Maven, JDBC, H2
- Admin content — protected Java CRUD API with a lightweight secret header
- Catalog — persistent file-backed H2 database with an in-memory read snapshot

## Run locally on Windows / VS Code

Use Node.js 22+ and Java 17+.

From the repository root:

```powershell
Copy-Item backend\.env.example backend\.env
Copy-Item frontend\.env.example frontend\.env.local
```

Set a private `ADMIN_PASSWORD` in `backend\.env`. Never commit that file.

Start the API:

```powershell
.\backend\run-local.ps1
```

Start the frontend in another terminal:

```powershell
Set-Location frontend
npm ci
npm run dev
```

Open `http://127.0.0.1:5173`.

The Vite proxy sends `/api/*` to the Java API. For separate production hosting, set `VITE_API_URL` to the backend origin and set `CORS_ORIGINS` on the backend to the exact frontend origin.

## Admin panel

Open `/admin` on the frontend and enter the same private `ADMIN_PASSWORD` configured for the Java API.

The admin panel can:

- add, edit and delete projects
- add, edit and delete services
- control project slugs, descriptions, case-study copy, disciplines and visual metadata
- immediately update the public catalog without editing React source code

Admin writes go to the Java API and are stored in the H2 file database. The default database location is `./data/praxivon`. For a production deployment, the database path must point to persistent storage or be replaced with a managed SQL database.

## API

### Public

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/api/health` | Deployment health |
| GET | `/api/catalog` | Services + projects in one request |
| GET | `/api/services` | Service catalog |
| GET | `/api/projects` | Project catalog |
| GET | `/api/projects/{slug}` | One project |
| POST | `/api/contact` | Validated enquiry |

### Admin

These routes require the `X-Praxivon-Admin` header containing the configured admin secret.

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/api/admin/catalog` | Admin catalog snapshot |
| POST/PUT/DELETE | `/api/admin/services[/id]` | Manage services |
| POST/PUT/DELETE | `/api/admin/projects[/slug]` | Manage projects |

Do not expose the admin secret in source code, public environment variables, or Git history. Use the hosting provider's secret/environment-variable manager.

## Performance

The frontend now uses route-level lazy loading so heavy pages are split into separate chunks. The public catalog uses one combined API request, a short 3.5 second timeout, and static fallback data so a slow API never blocks the initial render.

The existing desktop Three.js experience remains constrained by viewport, pointer, reduced-motion and connection checks. Heavy assets should continue to be deferred where possible.

## Contact delivery

Set these backend variables before accepting real enquiries:

- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USERNAME`
- `SMTP_PASSWORD`
- `CONTACT_TO`
- `CONTACT_FROM`
- `CORS_ORIGINS`
- `ADMIN_PASSWORD`
- `DB_URL` (optional; defaults to file-backed H2)
- `PORT`

The API returns an unavailable state when mail delivery is not configured instead of claiming success.

The public contact address `hello@praxivon.com` is not verified. Confirm or replace it before launch.

## Checks

Frontend:

```powershell
Set-Location frontend
npm ci
npm test
npm run lint
npm run format:check
npm run build
```

Backend:

```powershell
Set-Location backend
.\mvnw.cmd --batch-mode verify
```

GitHub Actions runs the frontend checks and backend Maven verification on pushes to `main` and pull requests.

## Deployment

Build the frontend with `npm run build` and serve `frontend/dist` with SPA fallback routing. If the API is hosted separately, set `VITE_API_URL` at build time and configure `CORS_ORIGINS` on the Java service.

Use HTTPS, real SMTP credentials, a strong admin secret, and persistent database storage. Do not commit credentials or `.env` files.

Project artwork is illustrative concept work. Keep case studies labeled as concepts until approved screenshots and verified client outcomes are available.
