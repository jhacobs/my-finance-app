# Internal Transfer Detection Design

## Goal

Identify transactions between accounts owned by the user and exclude those
transactions from income, expense, net cash-flow, and future financial
calculations. Keep the imported transactions visible so the user can verify the
classification.

The user maintains multiple description fragments, such as `Hr JHA Aretz`.
Matching ignores capitalization and succeeds when a configured fragment occurs
anywhere in the imported transaction description.

## Scope

This feature adds transfer rules, classifies new and existing transactions,
excludes transfers from the three existing dashboard calculations, and shows
the classification in transaction lists. It does not rename the existing total
balance card, add other analytics, or introduce automated tests.

## Database Design

Add a `transfer_rules` table in the encrypted SQLite database. Each row stores a
user-maintained description fragment. Rules must be non-empty after trimming
and unique without regard to capitalization.

Add an `is_transfer INTEGER NOT NULL DEFAULT 0` column to `transactions` and an
index that supports queries filtering by this column. The stored value makes
the classification explicit and prevents each financial query from having to
repeat the matching logic.

Existing transactions initially remain non-transfers. Saving the first rule
immediately reclassifies them. Removing the final rule sets every transaction
back to non-transfer.

## Classification

A focused main-process transfer module owns rule validation, matching, rule
storage, and transaction reclassification.

Before matching, trim the configured fragment. Compare it with
`transactions.description` using case-insensitive substring matching. A
transaction is an internal transfer when at least one current rule matches.

CSV import loads the current rules once and applies the same matching behavior
while normalizing imported rows. The resulting `is_transfer` value is stored
with every new transaction.

Adding, editing, or deleting a rule recalculates every existing transaction
against the complete current rule list in a database transaction. This ensures
that overlapping rules and rule deletion cannot leave stale classifications.

## Financial Calculations

Income, expense, and net cash-flow queries add `is_transfer = 0` to their
filters. Date-range behavior remains unchanged.

Transaction lists and counts continue to include transfers. The transaction
model returned through Electron IPC includes `is_transfer` so renderer
components can explain why a row does not contribute to dashboard totals.

Future financial calculations should use the stored classification rather than
implementing separate description matching.

## Electron API

Add IPC operations to list, create, update, and delete transfer rules. The
preload bridge exposes typed methods for those operations. Rule mutations return
only after reclassification completes, allowing the renderer to refresh all
affected queries.

Validation failures return a clear result for empty or duplicate rules.
Unexpected database or IPC failures use the application's existing error
notification behavior.

## Settings Page

Add a Settings item to the sidebar and a protected `/settings` route. The page
contains a small **Internal transfers** section with:

- A text input and **Add rule** button.
- A list of saved description fragments.
- **Edit** and **Delete** actions for each rule.
- Guidance that matching ignores capitalization and may occur anywhere in the
  transaction description.

The page trims input before saving and displays validation feedback for empty or
case-insensitive duplicate values. After a successful mutation, invalidate the
income, expense, net cash-flow, transaction-list, and transfer-rule queries so
visible data updates immediately.

## Transaction Display

Show a **Transfer** marker in both recent-transactions and full-transactions
tables when `is_transfer` is true. Preserve the imported income or expense
direction in the stored transaction; the marker communicates only that the row
is omitted from financial summaries.

## Failure Handling

Rule mutation and full reclassification occur in one SQLite transaction. A
failure rolls back both the rule change and transaction updates. The renderer
keeps its last confirmed rule list and shows an error notification rather than
displaying a partially applied change.

## Verification

Automated tests are intentionally deferred. Verify the implementation by:

- Running ESLint.
- Checking formatting without modifying unrelated files.
- Running the available TypeScript or packaging build check.
- Importing a CSV containing the supplied transfer example.
- Confirming case-insensitive substring matching.
- Confirming add, edit, and delete reclassify existing rows immediately.
- Confirming transfers remain visible with a marker.
- Confirming transfers do not affect income, expense, or net cash flow.
- Confirming removing the final rule restores the rows to normal calculations.

