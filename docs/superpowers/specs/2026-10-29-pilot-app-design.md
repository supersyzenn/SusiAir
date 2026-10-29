# Susi Air Pilot App design

## Intent and scope
Implement the supplied technical brief using its original JSON seeds. A pilot signs in, reviews flight limits and document validity, and browses monthly duties. Deliver a mobile-first Nuxt 3 application in `/nuxt`, a NestJS REST service in `/nest`, automated checks, deployment configuration, and setup documentation.

## Approaches
The user selected Nuxt 3 + NestJS with JSON loaded into memory. SQLite would support persistence but introduces a database that this read-only assignment does not require. Keep the original JSON files unchanged and copy them into the backend data folder for independent deployment.

## Constraints and decisions
- Nuxt 3 Composition API, script setup, TypeScript, Pinia, SCSS. NestJS TypeScript with module/controller/service/DTO separation.
- A single configurable business date defaults to `2026-05-15`. Ignore the conflicting `today` in the documents seed. Date-only arithmetic uses UTC to avoid DST/timezone drift.
- Daily/weekly/monthly/annual cards use inclusive 1/7/30/365-day windows ending on the business date. Limits are 8/40/100/1050 hours.
- Chart endpoint returns 15 dates, May 8–22 at the default business date; rolling windows are inclusive and use the seed chart configuration. Missing dates and dates before seed start contribute zero.
- Future chart dates are projections using supplied future seed records; identify them as projected in response and UI. This is a demo projection, not a claim of flown hours. Preserve the specified Y-axis maximum and show overflow markers and numeric tooltips if a value exceeds it.
- Document expiry status is computed on the server: <=0 days expired, 1–30 soon, >30 safe.
- Preserve actual duty codes (`DTY`, `RLV`, `TRX`, `ULV`, etc.) from the JSON and its legend; the API owns all duty colors. A day shows a check when logged equals scheduled; otherwise remaining = max(0, scheduled − logged). Empty days have no fabricated duty status.
- The profile uses the seed totalFlightHours of 1444.5, not a recalculated lifetime total. An API-provided local SVG avatar is a generated initials asset, because no avatar is supplied.
- Login accepts the brief's fixed account, returns a signed expiring JWT, and all application data routes require that token. JWT secret comes from environment in production. Errors share `{ statusCode, code, message, path }`; unexpected error details stay private.
- JWT lives in sessionStorage, restored through Pinia on the client. The app is client rendered; frontend contains no business seed data. A 401 clears the session and returns to sign-in. This demo has no password management or refresh tokens.
- UI uses the brief palette, Plus Jakarta Sans, official downloaded Susi Air logo, accessible form labels, loading/error/empty states, retry actions, fixed bottom navigation, and responsive desktop spacing. All product copy is English, matching the brief.
- Logbook and More are explicitly labeled coming-soon pages. Schedule date opens the required detail placeholder. No additional business features are implied.

## API contract
All protected routes use `Authorization: Bearer <token>`.
- `POST /auth/login`: `{ username, password }` → `{ accessToken, tokenType, expiresIn }`; 401 for incorrect credentials.
- `GET /pilot/me`: `{ name, totalFlightHours, avatarUrl, today }`.
- `GET /flight-hours?from=YYYY-MM-DD&to=YYYY-MM-DD`: `{ from, to, days: [{date,hours}] }`, inclusive, missing dates zero; reject reversed or >3660-day ranges.
- `GET /flight-hours/summary?range=1w|1m|3m|6m|1y`: `{ today, range, windowDays, limit, max, cards: [{key,label,hours,limit,windowDays}], series: [{date,hours,projected}] }`; default range 1w.
- `GET /documents`: `{ today, warningDays, documents: [{id,label,expiryDate,daysRemaining,status}] }`.
- `GET /schedules?year=YYYY&month=MM`: `{ today, year, month, legend, schedules }`; supports zero-padded months; validates real year/month; empty months return an empty list.
- `GET /health` requires auth as specified; deployment process-level checks need no public application route. Public logo/avatar are served by Nuxt, with avatar URL returned by backend.

## Structure and verification
Nest feature modules: auth, pilot, flight-hours, documents, schedules. Shared data module validates seeds on startup. Shared error filter and validation pipe apply globally. OpenAPI JSON and runnable Postman collection describe the public interface.

Tests cover hand-computed rolling boundaries, missing dates, future projection, chart bounds, document thresholds, JWT rejection and expiry, query validation, calendar generation, and real login/dashboard/month navigation in a browser. Build and typecheck both applications. Use a Dockerfile for backend and frontend Vercel configuration. Live publishing requires an available authenticated hosting connection; never describe a configuration file as a live deployment.

## Builder discretion
Choose compatible maintained package patch versions, focused component boundaries, chart implementation, and non-business UI spacing. Prefer a dependency-light SVG chart. No database, flight logging editor, actual detail screen, or production multi-user authentication is part of this test.

## Local refinement decisions
- User confirmed the app works and requested continued progress, retaining local-only scope.
- Bundle the verified official logo downloaded from susiair.com/images/susiair-logo.png.
- Use container-sized SVG coordinates to keep mobile axis text readable; a native date slider/readout exposes existing server values to touch and keyboard users.
- Preserve API duty colors while choosing high-contrast black/white text. The first readability pass used darker control/secondary-text shades; the user's later strict-palette instruction supersedes that choice. Role tokens now match the brief exactly, with text/background pairings and CTA typography preserving readable contrast.
- Verify the three main screens with automated axe AA rules in Chromium and WebKit, plus screenshots at 320/390/768/1440px. These checks do not substitute for manual assistive-technology or physical-device validation.
- The subsequent full-width refinement removes the1100px shell cap, extends visual checks to1920/2560px, and uses original official favicon/touch assets. Detail remains the specified placeholder with real-date validation and return-month context.

## Subsequent feature scope
After local acceptance, the user requested the next feature. The daily-hours Logbook replaces its original placeholder under `2026-10-29-logbook-design.md`; its bounded history and API statistics supersede the earlier coming-soon decision for Logbook. More and schedule detail remain placeholders.
