# Susi Air Pilot App

Production frontend: https://susiairpilot.vercel.app

Production API: https://susi-air-one.vercel.app

Mobile-first pilot workspace built from `Susi_Air_Technical_Brief_v3.pdf` and the three supplied JSON files. Nuxt 3 frontend, NestJS REST backend, no database. Includes Sign In, Home, Schedule, and the subsequently requested daily-hours Logbook.

## Run locally

Prerequisites: Node.js 22.12+ (Node 24 recommended), npm, and access to the npm registry.

```sh
npm install
cp nest/.env.example nest/.env
cp nuxt/.env.example nuxt/.env
```

Start the API and frontend in separate terminals from the repository root:

```sh
npm run dev:api
```

```sh
npm run dev:web
```

Open **http://localhost:3000**. API: **http://localhost:3001**.

Demo login: **johndoe / susiairtest**. This is the fixed test account specified by the brief, not a production authentication system.

## Environment

Backend (`nest/.env`):

| Variable | Default / requirement |
| --- | --- |
| `PORT` | `3001`; hosting provider may override |
| `APP_TODAY` | `2026-05-15`; valid date-only ISO string |
| `JWT_SECRET` | Local-only development fallback; production requires a secret of at least 32 characters |
| `CORS_ORIGINS` | `http://localhost:3000`; comma-separated frontend origins. Development also accepts equivalent localhost/127.0.0.1/0.0.0.0 origins on that same port; production requires exact configured origins. |
| `PILOT_AVATAR_URL` | `http://localhost:3000/avatar.svg`; set to deployed frontend `/avatar.svg` in production |
| `DATA_DIR` | Optional absolute seed directory; otherwise bundled `nest/data` |

Frontend (`nuxt/.env`, or hosting environment):

| Variable | Default / requirement |
| --- | --- |
| `NUXT_PUBLIC_API_BASE` | `http://localhost:3001`; deployed HTTPS backend origin in production |
| `NUXT_PUBLIC_LOGO_URL` | Optional verified official logo URL; otherwise `/susiair-logo.png` with a text fallback |

Never put `JWT_SECRET` into frontend variables. Set `NODE_ENV=production` on the deployed API. JWT expiry uses real authentication time; business calculations use `APP_TODAY` only.

## Brand asset

The official logo is bundled at `nuxt/public/susiair-logo.png`, downloaded from `https://susiair.com/images/susiair-logo.png` and visually checked. The browser favicon and 512px touch icon also use original assets linked by the official website; see [asset provenance](docs/brand-assets.md). To refresh the header logo from the official website, run:

```sh
npm run brand:fetch
```

This reads `https://susiair.com`, locates a logo image and downloads it to `nuxt/public/susiair-logo.png`. Inspect any replacement before publishing. Set `NUXT_PUBLIC_LOGO_URL` only when overriding the bundled asset. A text fallback remains available if the image cannot load. Plus Jakarta Sans loads from Google Fonts, with a local sans-serif fallback when offline. The local avatar is an illustrative pilot asset, not a supplied photo.

## Structure

```text
nest/                  NestJS feature modules, DTOs, guard, filter, seed data
nuxt/                  Nuxt 3 pages, Pinia session, SCSS, SVG chart, calendar
api/openapi.json       Authoritative generated API interface
postman/               Importable collection with positive/negative assertions
tests/e2e/             Real API-to-browser flow checks
docs/brand-assets.md   Official asset provenance and UI palette
```

Root JSON files are the untouched source files; `nest/data/` contains exact deployment copies. The frontend contains no seeded business data.

## API

See [OpenAPI](api/openapi.json) for complete schemas. Except login, every route requires `Authorization: Bearer <accessToken>`.

| Method | Endpoint | Result |
| --- | --- | --- |
| POST | `/auth/login` | `{accessToken, tokenType, expiresIn}`; token expires after 1 hour |
| GET | `/pilot/me` | Seeded profile, avatar URL and business date |
| GET | `/flight-hours?from=2026-05-01&to=2026-05-15` | Inclusive daily records, source bounds, business date and server-computed range statistics |
| GET | `/flight-hours/summary?range=1w` | Server-derived limit cards and 15-day rolling series |
| GET | `/documents` | Documents with days remaining and urgency status |
| GET | `/schedules?year=2026&month=05` | Month entries and original duty legend |
| GET | `/health` | Authenticated health response |

```sh
curl -X POST http://localhost:3001/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"johndoe","password":"susiairtest"}'
```

Use the returned token as the bearer credential. Parameter errors return HTTP 400; incorrect credentials and invalid/expired tokens return HTTP 401. Errors consistently contain `statusCode`, `code`, `message`, and `path`. `message` can be a string or validation-message array. Unknown query/body parameters are rejected.

The source for both generated API files is `scripts/generate-api-artifacts.py`. Edit its schema/operations, regenerate using `python3 scripts/generate-api-artifacts.py`, and review both outputs. Assertions stay alongside their operation definitions there. Do not maintain a separate conflicting contract in frontend mock data.

## Business choices

- **Reference date:** `2026-05-15` wins over the document seed's conflicting `2026-05-31`, as required by the brief.
- **Windows:** inclusive ending date, 1/7/30/365 days for cards; 7/30/90/180/365 days for the chart. Missing dates and dates before the seed begins contribute zero. Accumulated values are rounded to 2 decimals in the API; UI displays up to 1 decimal.
- **Future chart dates:** use supplied future seed values as projections; response includes `projected`, UI uses a dashed line and a clear note. Actual current limit cards never include future records.
- **Chart bounds:** retain the requested Y max of 45/125/325/625/1200 and limit of 40/100/300/600/1050. Over-limit values render normally. Values above the chart scale get a red boundary marker, exact tooltip, and a daily-total table, without resizing the chart.
- **Chart interaction:** the responsive SVG uses its actual container width to keep text readable. A native date slider supports touch and keyboard selection, exposing the precise server-calculated total and whether it is recorded or projected. No rolling arithmetic is added to the client.
- **Exact palette and readability:** role tokens exactly match the brief, including CTA/danger red `#E63757`, secondary text `#6B7280`, success `#1FBF8F`, warning `#F59E0B`, and chart cyan `#22C5E8`. Readability comes from foreground/background pairings and typography instead of darker replacement hues. Small secondary text sits on white surfaces; status badges use exact colored borders with navy labels; filled red CTA labels are bold 19px. Duty background colors remain exactly API-provided with contrast-selected black/white text.
- **Wide layout:** the shared application shell fills 100% of the viewport with fluid side gutters. Header, main and footer align without the former 1100px cap. Desktop limit cards and SVG height adapt to wide displays; mobile/tablet cards remain contained. Browser checks include 1920px and 2560px.
- **Known totals at May 15:** daily **6.4**, weekly **25.2**, monthly **87.2**, annual **1013.8** hours. Profile lifetime total remains the supplied **1444.5**.
- **Documents:** expiry day itself is expired. Next 30 days are soon; more than 30 safe. Status is computed by the API.
- **Schedules:** use seed duty codes and colors, including `DTY`, `RLV`, `TRD`, `TRX`, and `ULV`. For a date with multiple entries, display each duty and aggregate planned/logged counts. Equal totals show a check; otherwise show duties remaining. Empty months return an empty schedule, retaining the legend.
- **Session:** JWT is kept in Pinia and sessionStorage, cleared on sign-out/401. Client rendering avoids placing an authenticated browser token in SSR state. This assignment has no refresh flow.
- **Logbook:** monthly daily-hours history from the API, newest first, with recorded-hour totals, flying-day count and average per flying day computed on the server. The current month ends on the business date; navigation obeys source bounds. A checkbox filters zero-hour days without changing the API statistics. May 1–15 has 44 hours, 10 flying days and a 4.4-hour average. Individual flight numbers, aircraft, routes and writable entries are not present in the source data; the page accurately presents daily totals.
- **Scope:** Sign In, Home, Schedule, daily-hours Logbook and the requested detail placeholder. Schedule detail validates real dates and preserves the originating calendar month when returning; it still displays the brief's required 'Detail page coming soon'. More remains a future-feature placeholder. No unrequested flight-entry workflow is fabricated.

## Verify

```sh
npm run test:domain
npm test
npm run typecheck
npm run build
npx playwright install chromium webkit
npm run test:e2e
```

Stop the Nuxt dev server before running the production build; Nuxt prevents concurrent dev/build operations in the same project. Restart `npm run dev:web` afterward. Browser tests need both local services and can start them automatically when they are not already running.

The first command uses only Node and can run offline. Jest integration checks boot the real Nest application. Playwright tests run the real frontend against the real backend on iPhone and desktop profiles, including bad credentials, range changes, monthly navigation, placeholders, outage handling and session rejection.

`tests/e2e/accessibility.spec.ts` adds automated axe WCAG AA checks for the three original main screens, keyboard chart inspection, rendered label-size checks, and numeric containment at 320/768/1024px. `tests/e2e/logbook.spec.ts` adds Logbook accessibility, monthly statistics, bounds, filtering, partial-month/future exclusion, race handling and outage/empty states. These are browser/automation checks, not a claim of physical-device or manual screen-reader certification. WebKit skips navigation to `0.0.0.0`, a wildcard bind address that does not load there; use localhost or 127.0.0.1. The same alias remains tested on Chromium.

With both dev servers running, regenerate the visual QA screenshots using `node scripts/capture-ui.mjs`. It records sign-in, home, schedule, schedule detail and logbook at 320, 390, 768, 1440, 1920 and 2560px under `output/ui/` and reports JavaScript errors/overflow plus the favicon reference.

Import `postman/susiair.postman_collection.json` into Postman, or with a working Postman CLI and running API:

```sh
postman collection run postman/susiair.postman_collection.json
```

The collection logs in, captures its token, checks every chart range, documents, monthly filtering, and negative cases. It assumes the original seeds and default business date. No external API simulation is needed: the application calls only its own locally running API.

## Production builds and deployment

Backend independently:

```sh
cd nest
npm install
npm run build
npm start
```

Or build the supplied Dockerfile with `nest` as build context. The image includes only production runtime dependencies, compiled code and seed data. `render.yaml` configures a Render service and a generated JWT secret. Set frontend origin and avatar URL in Render. Health routes remain protected per the brief; use the platform's process/TCP health detection rather than an unauthenticated GET health check.

For deploying the backend to Vercel (Serverless):
Import the repository into Vercel, set root directory to `nest`, and use the **NestJS** framework preset. The supplied `nest/vercel.json` selects this preset, uses `src/main.ts` as the native server entrypoint, and includes the JSON seed data in the function bundle. Use Node.js 22.x. Add production environment variables `APP_TODAY=2026-05-15`, `JWT_SECRET=<random-secret-of-at-least-32-characters>`, `CORS_ORIGINS=<deployed-frontend-url>`, and `PILOT_AVATAR_URL=<deployed-frontend-url>/avatar.svg`.

Frontend independently:

```sh
cd nuxt
npm install
npm run build
npm start
```

For Vercel, import the GitHub repository, set project root to `nuxt`, use Nuxt framework detection and the supplied `vercel.json`, and set `NUXT_PUBLIC_API_BASE` to the deployed API HTTPS origin. Deploy a preview, set its exact origin in backend `CORS_ORIGINS`, and check login before production promotion. For a monorepo import, enable access to source files outside the root directory if Vercel needs the root workspace lockfile. Both packages also support independent repository deployment.

For CLI deployment from the repository root, select the matching Vercel project using `npx vercel deploy --project <project-name> --prod`. Keep the project's Root Directory set to `nest` or `nuxt` respectively. The root `.vercelignore` excludes local environment files, generated reports, and internal working notes from uploads. Set `NUXT_PUBLIC_API_BASE` before building the frontend; it must use the backend's public HTTPS origin rather than `localhost`.

## Current verification limits

The automated checks cover backend behavior, domain calculations, API assertions, and desktop/mobile browser flows. Run the commands above to verify your checkout. Visual QA screenshots and reports are generated locally and excluded from Git. Development CORS accepts equivalent local addresses on the configured frontend port; production remains restricted to exact configured origins. Manual screen-reader and physical-device checks remain outside the automated coverage.

## With more time

Replace the fixed account with real identity, secure cookie-based sessions/CSRF protection as appropriate, refresh/revocation, login rate limiting, and audit logs. Add persistent pilot-specific storage, CI dependency locking after a successful install, monitoring, and real flight logging once those features have an agreed contract. The supplied data is suitable for a demo, not operational compliance decisions.
