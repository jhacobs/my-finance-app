export type TransferRule = {
  id: number;
  value: string;
  created_at?: string;
  updated_at?: string;
};

export type TransferRuleMutationResult =
  | { success: true; rule?: TransferRule }
  | { success: false; error: string };
