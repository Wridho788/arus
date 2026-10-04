# Production and portfolio handoff — 2026-10-04

## Targets

- Local production artifact: `dist/`, served by Vite preview at `http://127.0.0.1:4175`.
- Public landing: <https://arus-web.vercel.app/>.
- Public app: <https://arus-web.vercel.app/app>.
- Public source: <https://github.com/Wridho788/arus>.
- Source baseline: `589d6428dfd8afc6e9fcc0acc141a137aebd4a8e` (`initial commit`), also observed at the remote HEAD.

The user deployed the application. This task verified that deployment; it did not redeploy, push source, or change hosting settings. Browser mutations occurred only inside isolated test contexts using the app's local storage.

## Evidence

| Check | Result |
| --- | --- |
| Fresh `npm run build` | Passed; static JS and CSS emitted to `dist/` |
| `npm run test:production` | 23/23 passed against production preview, one Chromium worker, zero retries |
| Public deployment smoke suite | 2/2 passed, at 1440×900 and 360×780 |
| Landing and direct `/app` | HTTP 200 locally and publicly; expected UI visible |
| Referenced production JS/CSS | HTTP 200; HTML contains no Vite development client |
| Transaction and budget CRUD | Create, edit, delete, reload persistence and reset passed in production smoke tests |
| Runtime errors | No `pageerror` events in either public smoke journey |
| Local/public asset equivalence | JavaScript and CSS match byte-for-byte and by SHA-256 |
| Typecheck and lint | Passed |
| Portfolio capture | Nine PNG screenshots and a reproducible manifest generated from production preview |

The local production suite includes the earlier 21 MVP, failure-state, contrast, keyboard and responsive tests plus two release smoke journeys. The public suite is deliberately limited to the two release smoke journeys. Passing the public smoke suite does not imply that every failure-injection scenario was rerun on Vercel.

Machine-readable asset comparisons are in [deployment-assets.json](deployment-assets.json); screenshot metadata and asset hashes are in [screenshots/manifest.json](screenshots/manifest.json). Test run JSON is written to `test-results/production/results.json` and `test-results/deployed/results.json` and is regenerated when tests run.

## Reproduce

```powershell
npm run build
npm run test:production
```

To verify the existing public deployment without starting a local server:

```powershell
$env:PLAYWRIGHT_BASE_URL = 'https://arus-web.vercel.app'
try {
  npm run test:production
} finally {
  Remove-Item Env:PLAYWRIGHT_BASE_URL
}
```

`playwright.production.config.ts` selects production preview when the environment variable is absent, and only the release smoke suite when a deployed base URL is supplied. The development config excludes the release-only tests. The production config uses a direct configuration override so an inherited development server is not started alongside preview or public checks.

```powershell
npm run capture:portfolio
```

Capture uses a separate preview on port 4176, waits for fonts, resets scroll position, and uses clean seeded data. The screenshot demo clock is October 15, 2026; the actual capture timestamp is recorded separately. The resulting files were visually inspected for layout, clipping, legibility and unintended test entries.

## Limits and remaining handoff

- Chromium with viewport emulation was tested. Physical phones, Safari, Firefox and assistive technology were not tested.
- Data remains local to a browser and origin. Clearing site data removes it; local preview and Vercel do not share records. This is a demo, with no account, cloud backup, bank integration or payment capability.
- The asset comparison describes the deployment at the recorded verification time. A later deployment requires a new check.
- The application source and demo are public. Following the owner's subsequent instruction, the testing configuration, case study and screenshot package were committed/pushed as Arus `351e745`. The portfolio card, screenshot and case study were committed/pushed as `ridho-portfolio` `66f4474`. Portfolio lint and production build passed, as did local Chromium checks at 1440px and 360px for card links, case-study navigation, image loading, mobile slider counts/navigation, overflow and runtime errors. The generated sitemap includes Arus. Public portfolio hosting availability must be checked separately after deployment.
