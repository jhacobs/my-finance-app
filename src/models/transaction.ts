import { DateRangeFilter } from "@/models/filters";

export type Transaction = {
  id: number;
  date: string;
  description: string;
  account: string;
  to_account?: string;
  code: string;
  transaction_type: "income" | "expense";
  is_transfer: boolean;
  amount_in_cents: number;
  mutation_type: string;
  remarks?: string;
  amount_after_transaction_in_cents: number;
  tag?: string;
  created_at?: string;
  updated_at?: string;
};

export type TransactionFilter = {
  date_range: DateRangeFilter;
};
