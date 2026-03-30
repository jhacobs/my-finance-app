import { getDB } from "@/db/db";
import { TransactionFilter } from "@/models/transaction";
import { format } from "date-fns";

export const getTotalBalance = (filters?: TransactionFilter): number => {
  const db = getDB();

  const query = `
      SELECT
        (
          SELECT SUM(amount_in_cents)
          FROM transactions WHERE transaction_type = 'income'
          ${filters ? "AND date BETWEEN ? AND ?" : ""}
        )
          -
        (
          SELECT SUM(amount_in_cents)
          FROM transactions
          WHERE transaction_type = 'expense'
          ${filters ? "AND date BETWEEN ? AND ?" : ""}
        )
        AS total_balance
    `;

  const bindings: string[] = [];
  if (filters) {
    const from = format(filters.date_range.from, "yyyy-MM-dd");
    const to = format(filters.date_range.to, "yyyy-MM-dd");

    // First pair for the income subquery, second pair for the expense subquery
    bindings.push(from, to, from, to);
  }

  const result = db
    .prepare<string[], { total_balance: number }>(query)
    .get(...bindings);

  return (result?.total_balance ?? 0) / 100;
};
