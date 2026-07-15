# Transfer Rule TanStack Forms Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace local state and raw form bindings in transfer-rule add/edit forms with the same TanStack Form composition used by login and onboarding.

**Architecture:** Add one Zod schema shared by both forms. Keep rule queries, mutations, deletion, query invalidation, and selected edit ID in `TransferRulesSettings`, while focused add/edit child components each own a `useAppForm` instance and await a boolean mutation callback.

**Tech Stack:** React 19, TypeScript 5.8, TanStack Form 1.32, TanStack Query 5.90, Zod 4.4, existing `useAppForm`/`InputField`/`SubscribeButton` components.

## Global Constraints

- Do not add automated tests or a test framework.
- Manage both the add-rule and inline edit-rule forms with TanStack Form.
- Use the existing `useAppForm`, `form.AppField`, `field.InputField`, `form.AppForm`, and `form.SubscribeButton` pattern.
- Validate both forms with one Zod submit schema requiring a non-whitespace value.
- Keep main-process trimming and duplicate validation authoritative.
- Reset the add form only after success; keep input after validation, database, or IPC failure.
- Close the edit form only after success or explicit Cancel; keep input after failure.
- Await IPC, reclassification, and query invalidation so TanStack Form retains its submitting state.
- Preserve the current `For example, J Jansen` placeholder.
- Do not modify, format, stage, or commit `src/renderer/routeTree.gen.ts`.
- Preserve unrelated changes in `docs/README.md` and `docs/financial-insights-roadmap.md`.

---

### Task 1: Refactor Add and Edit Rule Forms

**Files:**
- Create: `src/renderer/schemas/transfer-rule-schema.ts`
- Modify: `src/renderer/components/transfer-rules-settings.tsx`

**Interfaces:**
- Produces: `TransferRuleFormSchema`, a Zod schema for `{ value: string }`.
- Consumes: `useAppForm`, existing TanStack Query mutations, and `TransferRule`.
- Child callback contract: `(value: string) => Promise<boolean>`, where `true` means the main-process mutation and all invalidations completed successfully.

- [ ] **Step 1: Add the shared Zod schema**

Create `src/renderer/schemas/transfer-rule-schema.ts`:

```ts
import * as z from "zod";

export const TransferRuleFormSchema = z.object({
  value: z
    .string()
    .trim()
    .min(1, { message: "Transfer description is required" }),
});
```

- [ ] **Step 2: Replace raw add/edit forms with TanStack Form components**

Replace `src/renderer/components/transfer-rules-settings.tsx` with:

```tsx
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/renderer/api/query-keys";
import { Button } from "@/renderer/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/renderer/components/ui/card";
import { Field } from "@/renderer/components/ui/field";
import { useAppForm } from "@/renderer/forms/app-form";
import { TransferRuleFormSchema } from "@/renderer/schemas/transfer-rule-schema";
import type { TransferRule } from "@/models/transfer-rule";

type AddTransferRuleFormProps = {
  onSubmit: (value: string) => Promise<boolean>;
};

function AddTransferRuleForm({ onSubmit }: AddTransferRuleFormProps) {
  const form = useAppForm({
    defaultValues: { value: "" },
    validators: { onSubmit: TransferRuleFormSchema },
    onSubmit: async ({ value }) => {
      const success = await onSubmit(value.value);
      if (success) form.reset();
    },
  });

  return (
    <form
      className="flex items-end gap-2"
      onSubmit={(event) => {
        event.preventDefault();
        form.handleSubmit();
      }}
    >
      <div className="flex-1">
        <form.AppField
          name="value"
          children={(field) => (
            <field.InputField
              id="new-transfer-rule"
              label="Transfer description"
              type="text"
              placeholder="For example, J Jansen"
            />
          )}
        />
      </div>
      <Field>
        <form.AppForm>
          <form.SubscribeButton label="Add rule" />
        </form.AppForm>
      </Field>
    </form>
  );
}

type EditTransferRuleFormProps = {
  rule: TransferRule;
  onSubmit: (value: string) => Promise<boolean>;
  onCancel: () => void;
};

function EditTransferRuleForm({
  rule,
  onSubmit,
  onCancel,
}: EditTransferRuleFormProps) {
  const form = useAppForm({
    defaultValues: { value: rule.value },
    validators: { onSubmit: TransferRuleFormSchema },
    onSubmit: async ({ value }) => {
      const success = await onSubmit(value.value);
      if (success) onCancel();
    },
  });

  return (
    <form
      className="flex items-end gap-2"
      onSubmit={(event) => {
        event.preventDefault();
        form.handleSubmit();
      }}
    >
      <div className="flex-1">
        <form.AppField
          name="value"
          children={(field) => (
            <field.InputField
              id={`transfer-rule-${rule.id}`}
              label="Transfer description"
              type="text"
            />
          )}
        />
      </div>
      <Field>
        <form.AppForm>
          <form.SubscribeButton label="Save" />
        </form.AppForm>
      </Field>
      <form.Subscribe selector={(state) => state.isSubmitting}>
        {(isSubmitting) => (
          <Button
            type="button"
            variant="outline"
            disabled={isSubmitting}
            onClick={onCancel}
          >
            Cancel
          </Button>
        )}
      </form.Subscribe>
    </form>
  );
}

export default function TransferRulesSettings() {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const rules = useQuery({
    queryKey: queryKeys.transferRules.index,
    queryFn: () => window.electronAPI.getTransferRules(),
  });

  const refreshAffectedQueries = async () => {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: queryKeys.transferRules.index,
      }),
      queryClient.invalidateQueries({
        queryKey: queryKeys.transactions.index,
      }),
      queryClient.invalidateQueries({ queryKey: queryKeys.balance.index }),
    ]);
  };

  const createRule = useMutation({
    mutationFn: (value: string) => window.electronAPI.createTransferRule(value),
    onSuccess: async (result) => {
      if (!result.success) {
        toast.error(result.error);
        return;
      }

      await refreshAffectedQueries();
      toast.success("Transfer rule added.");
    },
    onError: () => toast.error("Could not update transfer rules."),
  });

  const updateRule = useMutation({
    mutationFn: ({ id, value }: { id: number; value: string }) =>
      window.electronAPI.updateTransferRule(id, value),
    onSuccess: async (result) => {
      if (!result.success) {
        toast.error(result.error);
        return;
      }

      await refreshAffectedQueries();
      toast.success("Transfer rule updated.");
    },
    onError: () => toast.error("Could not update transfer rules."),
  });

  const deleteRule = useMutation({
    mutationFn: (id: number) => window.electronAPI.deleteTransferRule(id),
    onSuccess: async (result) => {
      if (!result.success) {
        toast.error(result.error);
        return;
      }

      await refreshAffectedQueries();
      toast.success("Transfer rule deleted.");
    },
    onError: () => toast.error("Could not update transfer rules."),
    onSettled: () => setDeletingId(null),
  });

  const createTransferRule = async (value: string): Promise<boolean> => {
    try {
      const result = await createRule.mutateAsync(value);
      return result.success;
    } catch {
      return false;
    }
  };

  const updateTransferRule = async (
    id: number,
    value: string,
  ): Promise<boolean> => {
    try {
      const result = await updateRule.mutateAsync({ id, value });
      return result.success;
    } catch {
      return false;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Internal transfers</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Add part of the transaction description that identifies transfers
          between your own accounts. Matching ignores capitalization and can
          occur anywhere in the description.
        </p>

        <AddTransferRuleForm onSubmit={createTransferRule} />

        {rules.isLoading && (
          <p className="text-sm text-muted-foreground">Loading rules...</p>
        )}

        {rules.isError && (
          <p className="text-sm text-destructive">
            Transfer rules could not be loaded.
          </p>
        )}

        {rules.data?.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No transfer rules configured.
          </p>
        )}

        <div className="space-y-2">
          {rules.data?.map((rule) => {
            const isEditing = editingId === rule.id;
            const isDeleting = deletingId === rule.id && deleteRule.isPending;

            if (isEditing) {
              return (
                <EditTransferRuleForm
                  key={rule.id}
                  rule={rule}
                  onSubmit={(value) => updateTransferRule(rule.id, value)}
                  onCancel={() => setEditingId(null)}
                />
              );
            }

            return (
              <div
                className="flex items-center justify-between gap-3 rounded-lg border p-3"
                key={rule.id}
              >
                <span>{rule.value}</span>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isDeleting}
                    onClick={() => setEditingId(rule.id)}
                  >
                    Edit
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    disabled={isDeleting}
                    onClick={() => {
                      setDeletingId(rule.id);
                      deleteRule.mutate(rule.id);
                    }}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 3: Format and verify without changing generated routes**

Run:

```bash
npx prettier --check src/renderer/components/transfer-rules-settings.tsx src/renderer/schemas/transfer-rule-schema.ts
npm run lint
npx vite build --config vite.renderer.config.mts --outDir /private/tmp/my-finance-transfer-form-renderer
git diff --check
```

Expected: Prettier, ESLint, renderer build, and whitespace checks exit 0. The renderer build may rewrite `src/renderer/routeTree.gen.ts`; if it does, leave the user's pre-existing working-tree version untouched rather than staging or formatting it.

Manually verify:

1. Whitespace-only add and edit submissions show `Transfer description is required`.
2. Add stays disabled while the mutation and invalidations run, then resets after success.
3. Failed add retains its input.
4. Edit begins with the stored value, stays disabled while saving, and closes after success.
5. Failed edit retains its input and remains open.
6. Cancel closes edit without saving.

- [ ] **Step 4: Commit only the refactor files**

```bash
git add src/renderer/components/transfer-rules-settings.tsx src/renderer/schemas/transfer-rule-schema.ts
git commit -m "refactor(transfers): use TanStack forms"
```

Before committing, confirm `git diff --cached --name-only` lists exactly those two paths and does not list `src/renderer/routeTree.gen.ts` or documentation files.
