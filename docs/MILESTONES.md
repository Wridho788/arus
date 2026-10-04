# Milestones — Arus

Status is updated as work is completed. A checked box means the stated deliverable exists and the evidence noted below was observed; the milestone gate remains open until its separate verification is complete.

**Current state (2026-10-04):** tasks 1–3 are complete locally. Functionality, storage failures, keyboard behavior and responsive layouts were verified in Chromium; production preview and deployment remain open. See [Verification](VERIFICATION.md) for the evidence matrix and command results.

## Next actions

1. **Task 4 — Production verification:** preview the built artifact, including direct navigation to `/app`, and check the core journeys against that artifact.
2. **Task 5 — Portfolio material:** prepare publication-quality screenshots, a short case study, and complete handoff documentation. QA screenshots already exist as test output.
3. **Task 6 — Publish and deploy:** prepare public source, deploy the static site, verify public landing/app URLs, and record the deployment URL/date.

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
- [ ] Verify the production preview and direct `/app` navigation against the built artifact.
- [ ] Add project screenshots and a case study suitable for the portfolio.

**Gate:** remains open until production preview and portfolio material are verified.

## M3 — Deploy and handoff

- [ ] Initialize and review the project's Git history, then publish the source repository.
- [ ] Deploy the static build.
- [ ] Verify the public URL on phone and desktop, including direct app navigation.
- [ ] Record URL, verification date, and known limitations in README.
- [ ] Link the finished project from the portfolio after the case study is ready.

**Gate:** a reviewer can open the demo, use CRUD, and find source and documentation.
