# Development guide — Arus

## Setup and commands

Run commands from the project root.

```powershell
npm install
npm run dev
npm run typecheck
npm run test
npm run test:e2e
npm run lint
npm run build
```

Use Node.js 22.12 or later, as required by the current Vite line. The app runs locally without environment variables or network services after dependencies are installed.

## Verification and release commands

Tasks 1–5 were completed locally on 2026-10-04. Chromium and its headless shell are available. The suite has 12 unit tests, 21 development browser tests and two additional release smoke tests. See [MVP verification](VERIFICATION.md) and [release verification](portfolio/RELEASE_VERIFICATION.md).

```powershell
npx playwright install chromium
npm run test:e2e
npm run build
npm run test:production
npm run capture:portfolio
```

Playwright uses one worker and zero retries. The development suite targets Vite with React Strict Mode; the production suite runs all 23 tests against the static artifact on port 4175. Production-only checks verify direct routes, successful asset responses and absence of the Vite development client. Build before running production tests or captures.

For the owner's existing Vercel deployment:

```powershell
$env:PLAYWRIGHT_BASE_URL = 'https://arus-web.vercel.app'
try {
  npm run test:production
} finally {
  Remove-Item Env:PLAYWRIGHT_BASE_URL
}
```

A deployed base URL runs only the two release smoke journeys, with no local web server. All records are isolated within the test browser contexts.

QA screenshots are regenerated under `test-results/`. Final portfolio screenshots live in `docs/portfolio/screenshots/`; `capture:portfolio` starts its own production preview on port 4176 and replaces those nine PNGs and their manifest. Inspect the images after any UI changes. Local preview and the public deployment use separate browser origins and therefore separate saved data.

The documentation/testing package was published in Arus commit `351e745`. The portfolio integration was published in `ridho-portfolio` commit `66f4474`, with a Selected Work card and `/case-studies/arus/` page. The portfolio static build and desktop/phone checks passed; verify its public hosting update separately. See [Milestones](MILESTONES.md#next-actions).

## Working rules

1. Keep UI, calculations, and persistence separate. Only the repository module may call browser storage.
2. Add one observable flow at a time, with tests for calculations and persistence boundaries.
3. Store rupiah as integers and local dates as `YYYY-MM-DD`; do not use floating-point currency or convert calendar dates through UTC.
4. Use original layout, copy, icons, and assets. The Dribbble shot is visual inspiration, not a source of reusable artwork.
5. Update milestone status and README when a feature or deployment is actually verified.

## Manual review

- Open the landing page at 360px, tablet, and desktop widths; follow **Open demo**.
- Add an expense, reload, edit it, then delete it. Check the monthly totals after each action.
- Add and edit a category budget; verify its progress changes with matching expense transactions.
- Use keyboard only for navigation, forms, and confirmation controls.
- Try an empty transaction list and invalid amounts/dates.
- Reset demo data and verify the seeded records return once.

## Release

Run typecheck, lint, tests, browser tests, and production build. Preview the built artifact locally before deploying to a static host. Check the deployed landing page and direct app URL on both desktop and phone. Keep the local-data limitation visible in the UI and README.
