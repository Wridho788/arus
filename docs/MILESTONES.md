# Milestones — Arus

Status is updated as work is completed. A checked box means the stated deliverable exists and the evidence noted below was observed; the milestone gate remains open until its separate verification is complete.

**Current state (2026-10-04):** tasks 1–5 are complete. The owner published the source and deployed the app. Production preview and public desktop/phone smoke checks passed; final screenshots and a case study are ready. See [Release verification](portfolio/RELEASE_VERIFICATION.md).

## Next actions

1. Verify the portfolio hosting update after publishing commit `66f4474` in [ridho-portfolio](https://github.com/Wridho788/ridho-portfolio). Local static export and desktop/phone browser checks passed for `/case-studies/arus/`; public availability is a separate check.
2. Re-run the production/public checks after future application changes.

## M0 — Product contract

- [x] Define users, MVP journeys, acceptance criteria, and exclusions.
- [x] Define local-only data model and architecture.
- [x] Define development and verification workflow.

**Gate:** README, PRD, architecture, TRD, milestones, and development guide agree on scope.

## M1 — Working local product

- [x] Build the landing page and app shell; both compile in the production build.
- [x] Add first-visit example data and a versioned local repository; repository tests pass.
- [x] Wire transaction CRUD and derived dashboard totals to local persistence; domain tests pass.
- [x] Wire monthly budget CRUD and progress to local persistence; domain tests pass.
- [x] Verify empty, invalid-input, and storage-recovery UI states in browser tests.
- [x] Complete phone, tablet, and desktop browser walkthroughs at 360px, 768px and 1440px, using automated CRUD journeys and visual screenshot review.

**Gate:** local Chromium walkthroughs, visual review and focused domain tests pass; physical-device testing is not claimed.

## M2 — Release quality

- [x] Write end-to-end tests for create, edit, delete, reload, reset, and phone width.
- [x] Pass typecheck, lint, 12 unit tests, and production build locally; command evidence is recorded in Verification.
- [x] Install Playwright Chromium and pass 21 end-to-end tests with retries disabled.
- [x] Review keyboard flow, focus, mobile layout, primary text contrast and demo labeling.
- [x] Verify production preview and direct `/app` navigation: 23 tests passed against the built artifact.
- [x] Add nine final screenshots, a capture manifest, and a portfolio case study.

**Gate:** passed for the current Chromium verification scope; see release limitations.

## M3 — Deploy and handoff

- [x] Owner initialized and published the source repository; local and remote HEAD `589d642` were verified.
- [x] Owner deployed the static build to Vercel.
- [x] Verify public desktop and phone viewport smoke journeys, including direct `/app` navigation.
- [x] Record URL, verification date and known limitations in README.
- [x] Publish the handoff documents, screenshots and test configuration: Arus commit `351e745` pushed to `origin/master`.
- [x] Link the finished project from the portfolio: `ridho-portfolio` commit `66f4474` pushed to `origin/master`, adding a Selected Work card, screenshot and case study with demo/source links.

**Gate:** demo, source and handoff package are public; portfolio integration is pushed and locally verified. Confirm the portfolio host serves the new page after its deployment finishes.
