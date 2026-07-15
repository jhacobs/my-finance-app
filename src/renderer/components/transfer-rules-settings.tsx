import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { TransferRule } from "@/models/transfer-rule";
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

type AddTransferRuleFormProps = {
  onSubmit: (value: string) => Promise<boolean>;
};

function AddTransferRuleForm({ onSubmit }: AddTransferRuleFormProps) {
  const form = useAppForm({
    defaultValues: { value: "" },
    validators: { onSubmit: TransferRuleFormSchema },
    onSubmit: async ({ value }) => {
      const success = await onSubmit(value.value);

      if (success) {
        form.reset();
      }
    },
  });

  return (
    <form
      className="flex items-start gap-2"
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
      <Field className="w-22 pt-8">
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

      if (success) {
        onCancel();
      }
    },
  });

  return (
    <form
      className="flex items-start gap-2"
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
      <Field className="pt-8 w-22">
        <form.AppForm>
          <form.SubscribeButton label="Save" />
        </form.AppForm>
      </Field>
      <form.Subscribe selector={(state) => state.isSubmitting}>
        {(isSubmitting) => (
          <Button
            className="mt-8"
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
