import { getDB } from "@/db/db";
import { TransactionFilter } from "@/models/transaction";
import { format } from "date-fns";

export const getTotalTransactions = (filters?: TransactionFilter): number => {
  const db = getDB();

  const bindings: unknown[] = [];

  if (filters) {
    bindings.push(
      format(filters.date_range.from, "yyyy-MM-dd"),
      format(filters.date_range.to, "yyyy-MM-dd"),
    );
  }

  return (
    db
      .prepare<unknown[], { count: number }>(
        `
        SELECT COUNT(*) as count FROM transactions
        ${filters ? "WHERE date BETWEEN ? AND ?" : ""}
      `,
      )
      .get(bindings)?.count ?? 0
  );
};
