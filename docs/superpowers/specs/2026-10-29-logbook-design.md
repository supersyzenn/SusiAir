# Daily-hours Logbook

The user requested the next feature and has repeatedly asked for direct execution. Continue the existing local-only project with a Logbook page replacing its placeholder. Build on the supplied daily-hours data; do not invent flight numbers, aircraft, routes or writable flight entries.

## Approach
Use the existing authenticated `GET /flight-hours` endpoint, adding backwards-compatible metadata and statistics. The other considered approach, per-flight CRUD backed by a new database, needs fields and workflows absent from the source material and changes the approved JSON-in-memory architecture. A client-only prototype would duplicate server statistics; keep calculations on the backend.

## API
Preserve `from`, `to`, `days` and validation/guard behavior. Add `today`, `dataStart`, `dataEnd` (earliest/latest source dates or null for an empty source), and `statistics: { totalHours, flyingDays, averageFlyingDayHours }`. Compute statistics across the requested inclusive daily series on the server; a flying day has hours > 0; zero flying days yields average zero. Round numeric statistics to two decimals. The endpoint retains its ability to query future seeded values; the Logbook itself caps its query at today and therefore never labels future projected data as logged hours.

## UI
Authenticated `/logbook`, consistent shell and navy/red identity. Start at the business-date month. Fetch the pilot's business date before choosing an initial month, then fetch daily hours for the month, ending at the earlier of month end and business date. On responses, use source date bounds to limit month navigation; the earliest source month is selectable, missing pre-seed dates in that month remain zero under the existing contract. The latest selectable date is the earlier of business date and source end. Empty source returns a clear empty state.

Show three server-provided statistics: recorded hours, flying days, average per flying day. Display daily rows newest first with date, weekday and hours. A labeled checkbox toggles all days versus flying days, default all days so zero-hour dates remain visible. Label the current partial month 'Through 15 May 2026' using the API date. No frontend seed data, rolling calculations or extrapolated lifetime totals.

Previous/next month controls and 'Latest month' reset. The reset label remains accurate when the business date extends past the available source. Controls remain available during loading to support rapid browsing, but clamp to known bounds. Track request IDs so delayed responses cannot replace the latest month. Reset supersedes earlier navigation safely. Preserve error/retry/loading, auth redirect and accessible mobile/desktop layouts; show 0-statistic/empty state accurately.

## Verification
Real Nest HTTP tests assert literal seed totals for May 1–15 and April, missing-date/zero-range averages, and unchanged daily records. Browser tests cover default partial month, month navigation, zero-hour filtering, bounds, rapid responses, outage/retry, and empty source response; automated AA checks and screenshots cover the new screen. Update OpenAPI/Postman, run full tests/typecheck/build and leave both local servers usable. Deployment stays deferred.
