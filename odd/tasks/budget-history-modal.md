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
- Delivery strategy: ask-on-risk; actual running count exceeds approximately 400 authored changed lines. User selected `stacked-to-main` for future PR slices; no PR creation authorized. Reviewed slice: `2c57210`, `a502e58`; subsequent contact parity commit: `25fb544` (under budget, awaiting any future slice). Per-task 400-line estimate is advisory, not a hard cap.

## Tasks
- [x] BH-1: Model and render historical action entries and read-only snapshots using the existing details API. Acceptance: recognized event labels and chronological order, snapshot fields and historical receipt data where supplied, empty/error states. Route: delegated direct (multiple non-trivial files and preparation reads). Checks: 15/15 focused Vitest passed; build passed with existing bundle-size warning. Commit: `2c57210`. Risk assessment: medium, `under_budget` (pending slice from `ace0d65`).
- [x] BH-2: Wire "Ver historial" from the actions menu through the budget table/page into the modal. Acceptance: opening for the selected budget loads its history, selection shows the corresponding snapshot, close/reopen has no stale data, table row behavior stays unchanged. Route: delegated direct (multiple non-trivial files). Checks: focused Vitest 12/12 passed, focused ESLint and build passed; full `pnpm lint` blocked by 130 pre-existing parse errors under untracked `alquilandia-old/`. Commit: `a502e58`. Risk assessment: medium, slice budget reached; approved and acknowledged.
- [x] BH-3: Restore legacy customer phone and email to the historical snapshot without refreshing live user records. Acceptance: historical contact details appear when supplied and are absent when missing; tests cover both cases. Route: delegated direct (read for write and test edits). Checks: focused Vitest 7/7 passed (worker and parent), build and focused ESLint passed. Commit: `25fb544`. Risk assessment: medium, `under_budget` from reviewed boundary `a502e58`.
- [x] BH-4: Resolve historical technician hash to a readable name when the snapshot has no embedded name. Acceptance: a matching technician shows first and last name (including on creation events), embedded snapshot names take precedence, missing/unmatched hashes never appear as identifiers, and a pending technician load does not permanently display an identifier. Route: delegated direct (page and modal plus tests). Checks: focused Vitest 17/17 passed (worker and parent), targeted ESLint and build passed (existing chunk-size warning). Commit: pending. Risk assessment: pending.

## Progress and evidence
- Requirements confirmed: replicate the old behavior but display it visually in a modal, accessed via the menu.
- Current working tree has pre-existing unrelated modifications and untracked files; preserve them.
- Feature branch `feat/budget-history-modal` created. BH-1 implemented with historical financial fields, technician and scoped receipts; parent reran focused tests (15/15 passed). No browser scenario yet because the modal is not wired until BH-2. Rollback boundary: history types, modal and its tests.
- BH-2 wired and checked; parent reran focused integration Vitest (11/11 before final reopening regression; worker reran 12/12 after correction). Rollback boundary: menu/table/page wiring, history modal selection correction, related tests. No browser/API scenario was run.
- BH-2 commit `a502e58`; committed range from `ace0d65` assessed medium (`slice_budget_reached`) and reviewed with user consent, acknowledged under lineage `review-063c310ff9337387`. Reviewer warnings about VAT-without-IVA, the discounted subtotal, and nonstandard receipt types describe behavior replicated from the legacy detail, not new requirements; no correction to the acknowledged candidate.
- Independent post-review legacy readback found historic client phone and email missing from the new modal. BH-3 restored these fields as an additional work unit. Rollback boundary: contact fields in history modal and related tests. No browser or real API check was run. All source work units committed; no remote delivery performed. Preserve unrelated dirty state.
- User reported that the creation event shows the technician identifier instead of a name. Verified cause: the modal falls back to `technicianEmailHash` when snapshot technician is absent; the Budgets page neither loads nor supplies the existing technicians list. BH-4 will resolve by `emailHash` using existing Redux/RTK data, retaining the snapshot name if present. No remote data inspection authorized or performed.
- BH-4 uses the existing technicians list and thunk, with a safe unavailable label if a hash cannot be resolved. Tests include asynchronous list arrival, historical-name priority, unknown and absent hashes, and page list loading. Browser and real API remain unchecked. Rollback boundary: `Budgets.tsx`, `ModalBudgetHistory.tsx`, and their focused tests.
