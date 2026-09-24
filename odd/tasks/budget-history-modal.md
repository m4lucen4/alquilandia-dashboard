# Budget history modal migration

## Objective
Move the legacy budget history interaction to a "Ver historial" action in `BudgetsActionsMenu`, preserving chronological action history and read-only historical budget snapshots inside a modal.

## Problem and rationale
The legacy expandable budget row exposed event history and historical snapshots. The current table has no expandable rows; the user explicitly requested the same behavior through a menu action and modal instead.

## Scope and constraints
- Reuse the existing budget details endpoint and existing budget UI patterns; do not add a backend endpoint or dependencies.
- Preserve legacy event labels, order, historical snapshot data and safe receipt handling without substituting current invoices for historical receipts.
- Do not change unrelated dirty work, legacy sources, folder structure, or PDF generation.
- Authorized local implementation, focused tests, and ODD work-unit commits on a feature branch. No remote operations.
- TDD mode: not configured (source: inspected project configuration and repository docs); use ordinary functional checks with `pnpm exec vitest run` and `pnpm build`.
- Delivery strategy: ask-on-risk; forecast approximately 250–400 authored changed lines; per-task 400-line estimate is advisory, not a hard cap.

## Tasks
- [x] BH-1: Model and render historical action entries and read-only snapshots using the existing details API. Acceptance: recognized event labels and chronological order, snapshot fields and historical receipt data where supplied, empty/error states. Route: delegated direct (multiple non-trivial files and preparation reads). Checks: 15/15 focused Vitest passed; build passed with existing bundle-size warning. Commit: pending. Risk assessment: pending.
- [ ] BH-2: Wire "Ver historial" from the actions menu through the budget table/page into the modal. Acceptance: opening for the selected budget loads its history, selection shows the corresponding snapshot, close/reopen has no stale data, table row behavior stays unchanged. Route: delegated direct (multiple non-trivial files). Checks: focused Vitest, lint, build. Commit: pending. Risk assessment: pending.

## Progress and evidence
- Requirements confirmed: replicate the old behavior but display it visually in a modal, accessed via the menu.
- Current working tree has pre-existing unrelated modifications and untracked files; preserve them.
- Feature branch `feat/budget-history-modal` created. BH-1 implemented with historical financial fields, technician and scoped receipts; parent reran focused tests (15/15 passed). No browser scenario yet because the modal is not wired until BH-2. Rollback boundary: history types, modal and its tests.
- Next: record BH-1 work-unit commit and risk assessment; implement BH-2.
