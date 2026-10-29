# Full-width layout and exact brief palette

> Execute inline using the existing superpowers workflow. The user explicitly requests full-width responsive layout, exact brief colors, schedule detail according to the brief, and the official logo as favicon. Existing preference is direct execution; local-only scope persists.

**Goal:** Replace the1100px shell cap with a fluid100% layout and restore canonical brand-role colors without losing existing functionality.

**Design:** Shared app/header/footer gutters scale with viewport width. Four limit cards remain on desktop; mobile/tablet layouts remain contained. SVG chart height adapts on wide displays while preserving server values and axis limits. Use the exact brief role tokens: navy#0E2138, red/danger#E63757, background#F5F6F8, surface#FFFFFF, secondary text#6B7280, success#1FBF8F, warning#F59E0B, chart#22C5E8. Neutral borders/shadows may use alpha of those palette colors; API duty colors and official image assets remain unchanged. Keep small text readable through foreground/background pairing and typography rather than changing brand hues.

**Schedule detail:** The PDF explicitly requires 'Detail page coming soon'. Keep that page, validate real dates, and preserve the calendar month when returning from it. No per-flight detail API/data is invented.

**Favicon:** Inspect and reuse the icon/logo asset published by susiair.com; remove the unrelated generated airplane favicon reference.

## Tasks
- [x] Add failing browser coverage for wide layout containment and schedule-detail date/return behavior; add pure date/month validation cases.
- [x] Implement fluid shell, exact palette tokens and typography/background pairings; inspect rendered colors rather than testing stylesheet text.
- [x] Complete the specified detail placeholder flow and official favicon.
- [x] Run full backend/domain/browser suites, automated accessibility, typechecks/builds, rendered visual QA at small through ultrawide sizes, and local smoke checks.
- [x] Update requirement audit, verification and screenshots. No deployment.

## Evidence
38 backend tests,21 domain tests and39 browser tests passed with1 existing WebKit wildcard-address skip. Automated AA checks remain enabled. Both typechecks/builds passed; frontend restarted and3 desktop wide/detail smoke tests passed. Official favicon and touch icon respond200 with the expected image content types. Rendered colors are recorded in output/ui/brand-audit.json; six-width capture reports no page errors or horizontal overflow. Fresh source review found no material regression. Local-only scope retained.
