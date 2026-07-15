# Transfer Rule TanStack Forms Design

## Goal

Refactor both the add-rule and inline edit-rule forms in
`transfer-rules-settings.tsx` to use the same TanStack Form composition pattern
as the login and onboarding pages.

## Form Structure

Create two focused components:

- `AddTransferRuleForm`, initialized with an empty rule value.
- `EditTransferRuleForm`, initialized with the selected rule's current value.

Each component calls `useAppForm` at its top level. This avoids calling hooks
inside the rule-list loop and gives each visible form an independent TanStack
Form instance.

Both forms use the existing application form components:

- `form.AppField`
- `field.InputField`
- `form.AppForm`
- `form.SubscribeButton`

The edit form retains a separate outline-style Cancel button. The parent
`TransferRulesSettings` component retains the selected editing rule ID, rule
query, delete mutation, and shared query invalidation behavior.

## Validation

Add `src/renderer/schemas/transfer-rule-schema.ts` with a Zod object schema for
`value`. The value must contain at least one non-whitespace character after
trimming.

Both forms use this schema through `validators.onSubmit`, matching the
login/onboarding pattern. The main process remains responsible for authoritative
trimming, duplicate detection, and validation before database changes.

## Submission Behavior

Each form's TanStack `onSubmit` awaits an asynchronous mutation callback. This
keeps `form.SubscribeButton` disabled through the Electron IPC call,
transaction reclassification, and TanStack Query invalidation.

The add form resets only after a successful mutation result. A validation,
database, or IPC failure keeps the entered value visible.

The edit form closes only after a successful update. A failed update keeps the
form open with its current value. Cancel closes the form without saving.

Successful create and update operations continue to invalidate transfer-rule,
transaction, and balance query prefixes. Existing toasts and delete behavior
remain unchanged.

## Existing User Changes

Preserve the current `For example, J Jansen` placeholder. Do not modify or
format `src/renderer/routeTree.gen.ts`; its current working-tree change belongs
to the user and is unrelated to this refactor.

## Verification

Do not add automated tests. Verify the refactor with:

- Prettier checks for the changed component and schema.
- `npm run lint`.
- A renderer production build written outside the repository.
- Manual confirmation that add resets only on success, edit closes only on
  success, failures retain input, Cancel discards edits, and submit buttons stay
  disabled while their mutations are pending.

