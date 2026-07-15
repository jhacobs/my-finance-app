import { FormEvent, useState } from "react";
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
import { Input } from "@/renderer/components/ui/input";

export default function TransferRulesSettings() {
  const queryClient = useQueryClient();
  const [newValue, setNewValue] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState("");
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

      setNewValue("");
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

      setEditingId(null);
      setEditingValue("");
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

  const submitNewRule = (event: FormEvent) => {
    event.preventDefault();
    createRule.mutate(newValue);
  };

  const submitEditedRule = (event: FormEvent, id: number) => {
    event.preventDefault();
    updateRule.mutate({ id, value: editingValue });
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

        <form className="flex gap-2" onSubmit={submitNewRule}>
          <Input
            aria-label="Transfer description"
            value={newValue}
            onChange={(event) => setNewValue(event.target.value)}
            placeholder="For example, JHA Aretz"
          />
          <Button
            type="submit"
            disabled={!newValue.trim() || createRule.isPending}
          >
            Add rule
          </Button>
        </form>

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
                <form
                  className="flex gap-2"
                  key={rule.id}
                  onSubmit={(event) => submitEditedRule(event, rule.id)}
                >
                  <Input
                    aria-label={`Edit ${rule.value}`}
                    value={editingValue}
                    onChange={(event) => setEditingValue(event.target.value)}
                  />
                  <Button
                    type="submit"
                    disabled={!editingValue.trim() || updateRule.isPending}
                  >
                    Save
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={updateRule.isPending}
                    onClick={() => {
                      setEditingId(null);
                      setEditingValue("");
                    }}
                  >
                    Cancel
                  </Button>
                </form>
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
                    onClick={() => {
                      setEditingId(rule.id);
                      setEditingValue(rule.value);
                    }}
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
