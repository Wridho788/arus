# Technical requirements — Arus

## Stack

- React, TypeScript, and Vite for a static web build.
- CSS with design tokens and responsive layouts; no copied Dribbble artwork or templates.
- Browser `localStorage` behind a typed repository for the small MVP dataset.
- Vitest for domain and repository tests; Playwright for primary browser journeys.
- A static host for the demo. Hosting configuration must support direct navigation to the app route.

## Data model

```ts
type Transaction = {
  id: string;
  type: 'income' | 'expense';
  title: string;
  amount: number; // positive integer rupiah
  category: string;
  date: string; // local calendar date, YYYY-MM-DD
  note: string;
};

type Budget = {
  id: string;
  category: string; // expense category
  month: string; // YYYY-MM
  limit: number; // positive integer rupiah
};

type Snapshot = {
  version: 1;
  transactions: Transaction[];
  budgets: Budget[];
};
```

IDs are generated locally. Categories come from a small curated set for consistent summaries. Budget `(category, month)` pairs are unique. Dates are parsed as local calendar values; month membership comes from the stored `YYYY-MM-DD` string, avoiding UTC rollover.

## Persistence contract

- One versioned JSON snapshot under a project-specific storage key.
- No write before schema and domain validation succeeds.
- A failed write never updates visible application state as if it succeeded.
- Unknown future versions and corrupt snapshots show a recovery state with an explicit reset option.
- Seed data is inserted only when the storage key is absent; refreshes do not duplicate it.
- A reset restores seed data for the current month after confirmation.

## Validation and calculations

- Trim titles and notes; require a nonempty title and a known category for the chosen type.
- Accept only finite positive integer rupiah amounts; reject zero, fractions, negatives, and unsafe integers.
- Require a valid local calendar date.
- Monthly income and expense totals are sums of matching transactions. Net flow is income minus expense.
- A budget's used amount includes only expense transactions in the same category and month. Remaining may be negative to show overspend.

## Quality and accessibility

- Semantic headings, labeled controls, visible focus, keyboard-operable dialogs, and adequate contrast.
- Phone viewport starts at 360px with no horizontal page overflow.
- Tests cover money/date boundaries, create/edit/delete, reload persistence, budget recalculation, and reset.
- Build, typecheck, lint, and end-to-end smoke tests run before release.

## Deployment

The production artifact is static. No secrets or API keys are required. The public demo must state that records are local to the browser. The deployment URL and verification date will be recorded in `README.md` after release.
