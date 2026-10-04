# Praxivon Labs

An independent digital product studio portfolio. The repository contains a multi-page React frontend and a small Java API in separate top-level folders.

## Stack

- `frontend/` — React 19, Vite 7, Tailwind CSS 4, React Router, Framer Motion, Lucide icons
- `backend/` — Java 17, Spring Boot 4.1, Maven

## Run locally on Windows / VS Code

Use Node.js 22 or newer and a Java 17+ JDK. The checked-in Maven Wrapper downloads Maven for you; a separate Maven installation is not needed. On Windows with WinGet, install the JDK with:

```powershell
winget install --id EclipseAdoptium.Temurin.17.JDK --exact
```

Reopen VS Code after installation. In a VS Code PowerShell terminal, start at the repository root:

```powershell
Copy-Item backend\.env.example backend\.env
Copy-Item frontend\.env.example frontend\.env.local
```

Edit `backend\.env` only when you have real SMTP settings. The examples contain no credentials; leaving them blank keeps contact delivery safely unavailable and the site displays an email fallback.

Start the API in the first terminal:

```powershell
.\backend\run-local.ps1
```

`run-local.ps1` explicitly reads `backend\.env`, places its `KEY=value` entries in the process environment, and then launches Spring Boot through `mvnw.cmd`. Spring Boot does **not** load `.env` files by itself. Install a Java 17+ JDK; the launcher finds `JAVA_HOME` from `java` on `PATH` when possible, otherwise set `JAVA_HOME` to the JDK installation folder.

Start the frontend in a second terminal:

```powershell
Set-Location frontend
npm ci
npm run dev
```

Open `http://127.0.0.1:5173`. Vite proxies `/api/*` to `http://127.0.0.1:8080`; change `VITE_PROXY_TARGET` in `frontend\.env.local` if the API uses another local address. Keep `VITE_API_URL` empty to use that proxy. Catalog pages can render without the API; API routes and contact submission require the backend.

## Contact delivery

Set these environment variables in `backend\.env` before accepting contact messages:

| Variable                         | Purpose                                                            |
| -------------------------------- | ------------------------------------------------------------------ |
| `SMTP_HOST`, `SMTP_PORT`         | Your mail server and port (default port: `587`)                    |
| `SMTP_USERNAME`, `SMTP_PASSWORD` | Credentials from your mail provider                                |
| `CONTACT_TO`                     | Inbox you control that receives enquiries                          |
| `CONTACT_FROM`                   | Sender address authorized by your mail provider                    |
| `CORS_ORIGINS`                   | Comma-separated frontend origins when the API is on another origin |
| `PORT`                           | Optional API port (default: `8080`)                                |

See `backend\.env.example` for variable names. The local launcher loads the real `.env` values; direct invocations such as `.\backend\mvnw.cmd spring-boot:run` require the variables to be set in the shell separately. Real credentials and `.env` files must never be committed. The API returns `503` when delivery is unconfigured or fails; the contact page displays that state and offers an email fallback. A successful `202` means the mail sender accepted the message. For a public deployment, add abuse protection at the edge or API gateway.

The public contact address `hello@praxivon.com` is carried over from the supplied preview and is **not verified**. Confirm that you own and monitor it or replace it in `frontend/src/config.js` before launch. Set `CONTACT_TO` to the real receiving inbox and `CONTACT_FROM` to a sender authorized by your mail provider. Do not use an unverified address as a production fallback.

## API

| Method | Path                   | Response                                  |
| ------ | ---------------------- | ----------------------------------------- |
| `GET`  | `/api/services`        | Eleven service entries                    |
| `GET`  | `/api/projects`        | Five project entries                      |
| `GET`  | `/api/projects/{slug}` | One project or `404`                      |
| `POST` | `/api/contact`         | Validated enquiry; `202`, `400`, or `503` |

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

The catalog is seeded in the backend and mirrored in the frontend so the public pages render immediately, including when the API is not running. Keep the entries aligned when editing content. Project artwork is CSS-based illustrative concept work, not client screenshots or evidence of results. Keep each case study labeled as a concept until you provide approved screenshots and verified outcomes.

## Client pitching flow

Home and Services include problem → solution → workflow → illustrative improvement → benefits stories for CRM, ERP/SAP, Inventory Management and Website/Custom software. Share a specific story using `/#crm`, `/#erp`, `/#inventory`, `/#web` or the same fragments on `/services`. The ERP connection diagram supports hover, keyboard focus and touch. Existing projects, pages, brand content and the original email contact form are retained.

The hero uses a lazy-loaded Three.js scene on larger screens with a fine pointer. Mobile, reduced motion, constrained connections and WebGL failures use the static SVG. Graphs animate when visible; count-ups pause outside the viewport. All example improvements are explicitly marked **Illustrative estimates**, not verified client outcomes.

The sticky **Get a Demo** link opens `/contact#demo`. The final form accepts name, company, phone and problem through the existing `/api/contact` endpoint. Email is optional when a valid phone is supplied. A demo requires a company; phone numbers must contain 7–15 digits. For example:

```json
{
  "name": "Alex Rivera",
  "company": "Example Company",
  "phone": "+8801712345678",
  "service": "Business workflow demo",
  "message": "Our sales and stock records never match.",
  "website": ""
}
```

Existing email-only payloads remain valid. Both forms use the same SMTP delivery settings and report unavailable delivery instead of claiming success.

To enable direct WhatsApp enquiries, add your actual number to `frontend/.env.local` (and the frontend build environment), then restart or rebuild:

```dotenv
VITE_WHATSAPP_NUMBER=your_country_code_and_number
```

Use digits with the country code; formatting spaces or a leading `+` are accepted. This is a public number, not a secret. If no valid number is configured, the button says **Share brief on WhatsApp** and opens WhatsApp's recipient picker with the drafted brief. It does not send a message automatically. No contact number has been invented.

## Build and checks

```powershell
Set-Location frontend
npm ci
npm test
npm run lint
npm run format:check
npm run build
```

```powershell
Set-Location backend
.\mvnw.cmd --batch-mode verify
```

GitHub Actions runs frontend tests, lint, formatting, and build, plus the backend Maven verification on pushes to `main` and pull requests.

## Deployment notes

Build the frontend with `npm run build` and serve `frontend/dist` with SPA fallback routing to `index.html`, so direct loads of `/services`, `/work`, and `/work/{slug}` resolve to the app. Route `/api/*` to the Spring Boot service. If the API is hosted separately, set `VITE_API_URL` to its origin (without a trailing slash) when building the frontend and configure `CORS_ORIGINS` to the exact frontend origin(s) on the backend. Use HTTPS and real SMTP credentials. This repository does not configure hosting, domain ownership, verified inboxes, or deployment secrets.

Before launch, provide/confirm:

- Java 17+ installed locally (and Node.js 22+).
- A real receiving inbox, SMTP host/port/username/password, and authorized sender address.
- Confirmation or replacement of the displayed `hello@praxivon.com` public contact address.
- The production frontend origin for `CORS_ORIGINS` if frontend and API use separate origins.
- Approved project screenshots and verified client outcomes if concept studies are to be presented as completed client work.
