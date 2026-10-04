# Product requirements — Arus

## Purpose

Help an individual understand where their money goes and keep a simple monthly spending plan. Arus is a portfolio demo, not a financial service. The public landing page explains the product; the app demonstrates a complete local workflow.

## Users and problem

- **Primary user:** an individual tracking day-to-day spending in Indonesian rupiah.
- **Problem:** scattered notes make it hard to see this month's income, expenses, and remaining budget.
- **Outcome:** the user can record a transaction in under a minute, see updated totals immediately, and understand budget progress.

## MVP scope

1. A responsive landing page with a clear path to the interactive demo.
2. A dashboard showing income, expenses, net flow, budget progress, and recent transactions for the selected month (the current month by default).
3. Transaction CRUD: add, view, edit, and delete income or expense with amount, category, date, title, and optional note.
4. Transaction list with type/category filtering and text search; empty states are clear.
5. Monthly budget CRUD for expense categories. One budget per category per month; progress is calculated from matching expenses.
6. Example data on first visit and a deliberate **Reset demo data** action.
7. Local persistence across reloads in the same browser, with an actionable error when storage is unavailable or invalid.

## Core journeys

### Explore and start

The visitor understands the offer from the landing page, selects **Open demo**, and reaches a usable dashboard. On first visit, example data illustrates all primary views.

### Record a transaction

The user opens the transaction form, chooses income or expense, enters a positive rupiah amount, title, category, and local calendar date, then saves. The transaction appears in the list and the dashboard totals update. Invalid fields show inline feedback; a failed local save leaves the form open and reports the failure.

### Revise or remove a transaction

The user opens an existing transaction, edits it, and sees recalculated totals and budgets. Deletion requires confirmation and removes the record from all derived views.

### Plan a category budget

The user sets a monthly limit for an expense category. Arus displays used amount and remaining amount for the selected month; overspending is visible. The limit can be edited or deleted without deleting transactions.

## Acceptance criteria

- Layout remains usable at 360px phone width, tablet width, and desktop width; controls are reachable by keyboard and have readable labels.
- Amounts are positive whole rupiah values; stored values are integers, not floating-point currency.
- The selected-month totals and budget progress reflect transaction create, edit, and delete without a reload.
- Reloading the page retains changes in the same browser.
- Filters and search affect the list only, not the dashboard totals.
- Reset demo data asks for confirmation and restores a known example state.
- The app never presents demo entries as real financial account data.
- A production build can be served from a static host, and the core add/edit/delete flow passes an end-to-end browser test.

## Interaction details

- One month selection applies to the dashboard, transaction list, and budgets. Reload starts on the current month without changing saved records.
- Transactions are sorted by calendar date descending, with ID as a stable tie-breaker. New entries default to today in the current month, or day one in another selected month.
- Type and category filters combine with case-insensitive text search across title, note, and category label. Changing type clears the category filter; filters never change dashboard calculations.
- A search with no matches offers **Hapus filter**; a month with no transactions shows the first-entry guidance.
- Failed saves preserve the form and its input, and report an error inside the dialog. Failed delete/reset operations leave the previous data visible. Recovery offers a non-destructive retry as well as a confirmed reset.
- The phone menu and entry dialogs support keyboard navigation and Escape. Closing them restores focus to their trigger.

## Outside MVP

Accounts, bank aggregation, payments, investment advice, cloud backup, cross-device sync, shared budgets, recurring transactions, and native mobile apps.

## Portfolio success measure

A reviewer can open a public demo on desktop or phone, complete the core CRUD journeys, inspect public source, and read a short case study explaining design and storage decisions. No claims about financial outcomes or real users are implied.
