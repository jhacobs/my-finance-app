import { getDB } from "@/db/db";
import { TransactionFilter } from "@/models/transaction";
import { format } from "date-fns";

export const getTotalIncome = (filters?: TransactionFilter): number => {
  const db = getDB();

  const query = `
    SELECT SUM(amount_in_cents) as total_income
    FROM transactions
    WHERE transaction_type = 'income'
    AND is_transfer = 0
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
    .prepare<string[], { total_income: number }>(query)
    .get(...bindings);

  return (result?.total_income ?? 0) / 100;
};
