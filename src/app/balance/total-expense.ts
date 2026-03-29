import { getDB } from "@/db/db";
import { TransactionFilter } from "@/models/transaction";
import { format } from "date-fns";

export const getTotalExpense = (filters?: TransactionFilter): number => {
  const db = getDB();

  const query = `
      SELECT SUM(amount_in_cents) as total_expense
      FROM transactions
      WHERE transaction_type = 'expense'
      ${filters ? "AND date BETWEEN ? AND ?" : ""}
    `;

  const bindings: string[] = [];
  if (filters) {
    bindings.push(
      format(filters.date_range.from, "yyyy-MM-dd"),
      format(filters.date_range.to, "yyyy-MM-dd"),
    );
  }

  const result = db
    .prepare<string[], { total_expense: number }>(query)
    .get(...bindings);

  return (result?.total_expense ?? 0) / 100;
};
