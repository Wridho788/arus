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

## Verification status and next step

Tasks 1–3 were completed locally on 2026-10-04. Chromium and its headless shell are available. The suite includes 12 unit tests and 21 Chromium E2E tests; see the [verification record](VERIFICATION.md) for results and limitations.

For a fresh machine, install the matching browser once before running E2E:

```powershell
npx playwright install chromium
npm run test:e2e
```

Playwright uses one worker to limit memory use, zero retries, a 60-second test budget (120 seconds for responsive walkthroughs) and a 10-second action timeout. The responsive tests write QA screenshots to `test-results/`; later runs replace those files. The current tests exercise the Vite development server, including React Strict Mode.

Next, verify the production preview and direct `/app` navigation as task 4. Follow the remaining items in [Milestones](MILESTONES.md#next-actions). Do not treat a successful build as a production-browser verification.

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
