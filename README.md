# Praxivon Labs

An independent digital product studio portfolio. The repository contains a multi-page React frontend and a small Java API in separate top-level folders.

## Stack

- `frontend/` — React 19, Vite 7, Tailwind CSS 4, React Router, Framer Motion, Lucide icons
- `backend/` — Java 17, Spring Boot 4.1, Maven

## Run locally

Install Node.js 22+ and Java 17+ with Maven 3.6.3+.

Start the API in one terminal:

```bash
cd backend
mvn spring-boot:run
```

Start the frontend in another:

```bash
cd frontend
npm ci
npm run dev
```

Open the URL shown by Vite, normally `http://127.0.0.1:5173`. Vite proxies `/api` requests to `http://localhost:8080`. The pages can be browsed without the API; submitting the contact form requires a running API and configured SMTP delivery.

## Contact delivery

Set these environment variables for the backend before accepting contact messages:

| Variable | Purpose |
| --- | --- |
| `SMTP_HOST`, `SMTP_PORT` | Mail server and port (default port: `587`) |
| `SMTP_USERNAME`, `SMTP_PASSWORD` | Mail credentials, when required |
| `CONTACT_TO` | Inbox that receives enquiries |
| `CONTACT_FROM` | Verified sender address on your mail server |
| `CORS_ORIGINS` | Optional comma-separated frontend origins when the API is on another origin |
| `PORT` | Optional API port (default: `8080`) |

See `backend/.env.example` for a sample configuration. The example file is documentation; Spring Boot reads actual environment variables. Do not commit credentials. The API returns `503` when mail delivery is unavailable and the site offers an email fallback. A successful `202` means the mail sender accepted the message. For a public deployment, add abuse protection at the edge or API gateway.

The current contact address `hello@praxivon.com` comes from the supplied preview and must be verified before launch. Set `CONTACT_TO` to the real inbox and update `frontend/src/config.js` if that public address changes.

## API

| Method | Path | Response |
| --- | --- | --- |
| `GET` | `/api/services` | Ten service entries |
| `GET` | `/api/projects` | Five project entries |
| `GET` | `/api/projects/{slug}` | One project or `404` |
| `POST` | `/api/contact` | Validated enquiry; `202`, `400`, or `503` |

Example contact payload:

```json
{
  "name": "Alex Rivera",
  "email": "alex@example.com",
  "service": "Custom software",
  "message": "We are planning a new customer platform.",
  "website": ""
}
```

The catalog is seeded in the backend and mirrored in the frontend so the public pages render immediately, including when the API is not running. Keep the entries aligned when editing content. The project images are CSS-based illustrative concepts, and each case study says so; replace them with approved screenshots and verified outcomes before presenting them as client work.

## Build and checks

```bash
cd frontend
npm run lint
npm run format:check
npm run build
```

```bash
cd backend
mvn verify
```

GitHub Actions runs both checks on pushes to `main` and on pull requests.

## Deployment notes

Build the frontend with `npm run build` and serve `frontend/dist` with SPA fallback routing to `index.html`. Route `/api/*` to the Spring Boot service. If the API is hosted separately, set `VITE_API_URL` to its origin when building the frontend and configure `CORS_ORIGINS` on the backend. Use HTTPS and provide real SMTP credentials. No deployment or domain configuration is included in this repository.
