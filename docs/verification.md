# Local verification — 29 October 2026

The current scope is local execution only. No GitHub publication or hosting deployment was attempted after the user deferred deployment.

## Results

| Check | Result |
| --- | --- |
| `npm test` | 38 passed across 4 Nest/Jest suites, including Logbook statistics and source bounds |
| `npm run test:domain` | 21 passed: rolling windows, dates, documents, calendar/detail validation, duty text contrast and Logbook ranges |
| `npm run test:e2e` | 39 passed; 1 documented WebKit wildcard-address skip |
| `npm run typecheck` | Nest and Nuxt/Vue template typechecks passed |
| `npm run build` | Nest `dist` and Nuxt `.output` production builds passed |
| Local Postman collection | 14 requests and 39 assertions passed; exit 0; no workspace publication |
| Screenshots | Sign-in, Home, Schedule/detail and Logbook captured at 320, 390, 768, 1440, 1920 and 2560px |
| Browser capture diagnostics | No JavaScript page errors or horizontal overflow at those six widths |
| Brand palette/favicon | Browser-rendered role values match the brief; official favicon returns 200; see output/ui/brand-audit.json |
| Original seed copies | Root JSON files remain unchanged; `nest/data` copies match |
| Source review | Fresh reviewer found no material UI regression |

## What the browser tests establish

- Real bad-credentials feedback, successful sign-in, profile loading, chart range changes, document statuses, schedule navigation, detail placeholder and sign-out.
- API outage shows a retry and recovers when service access returns; rejected tokens clear the saved session.
- Delayed month responses do not replace newer requested months; December/January transitions work.
- Above-scale chart values expose overflow markers and exact tabular values without widening the viewport.
- Real login works through localhost and 127.0.0.1 in both browser engines; Chromium additionally tests 0.0.0.0.
- Automated axe rules tagged WCAG 2 A/AA and 2.1 AA pass for Sign In, Home and Schedule on Chromium desktop and WebKit iPhone emulation.
- SVG labels render at least 10px, and the date slider exposes all dates to keyboard users, including recorded/projected status.
- Numeric cards remain contained at 320, 768 and 1024px. The 320px regression was observed failing before its responsive fix.
- Logbook renders server totals for May 1–15 (44 hours, 10 flying days, 4.4-hour average), includes zero-hour days by default, and filters to flying days on request. April uses calendar-month totals, not rolling-month values.
- Logbook never requests history after the business date/source end, clamps to source start/end months, ignores stale requests, and recovers from API outages. Empty-source statistics stay finite and source bounds are nullable. Automated axe AA checks pass on its desktop and WebKit views.
- Shared app screens use the available 1920/2560px viewport without the former 1100px main-content cap or horizontal overflow. SVG plot height adapts to the wider container while preserving server limits and centered today.
- Schedule detail remains the requested placeholder, validates true dates rather than accepting normalized February30, and returns to the month from which it was opened. These regressions were observed failing before their fixes.

WebKit does not load the wildcard bind address `0.0.0.0` in this environment. That one navigation test is explicitly skipped, rather than presented as a pass. The supported local URLs are **http://localhost:3000** and **http://127.0.0.1:3000**.

## Visual review and brand asset

The bundled logo, favicon and touch icon were downloaded from official sources and inspected; see `brand-assets.md`. Sign-in, dashboard, chart, document rows, schedule/detail, status indicators and legend were inspected from compact to ultrawide. Exact brief colors are preserved through canonical tokens, with appropriate text/background pairings and CTA typography; automated contrast checks remain enabled and pass.

Screenshots: [mobile home](../output/ui/mobile-home.png), [mobile detail](../output/ui/mobile-schedule-detail.png), [mobile logbook](../output/ui/mobile-logbook.png), [wide home](../output/ui/wide-home.png), [ultrawide home](../output/ui/ultrawide-home.png), [ultrawide calendar](../output/ui/ultrawide-schedule.png). A fixed bottom navigation remains pinned to the initial viewport in full-page screenshot captures; scrolling in the actual browser keeps it at the viewport bottom.

Regenerate with both local servers running:

```sh
node scripts/capture-ui.mjs
```

## Remaining limits

- Automated axe checks are not a complete accessibility certification. Actual screen-reader announcements and physical iPhone/Android hardware were not manually verified.
- Deployment, external HTTPS/CORS hosting, GitHub publication, production identity, persistence, individual-flight editing and the future More/detail features are outside the current local scope.
- The provided app remains a deterministic demo with business date 15 May 2026. Future chart records are explicitly projected.

Earlier DNS, socket-permission and Postman-keychain failures were overcome for local verification. Their chronology is preserved in [progress.md](progress.md); those old blockers are not the current state.
