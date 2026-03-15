import { getDB } from "@/db/db";
import { PaginatedResponse } from "@/models/responses";
import { Transaction } from "electron";
import { getTotalTransactions } from "./total-transactions";
import { TransactionFilter } from "@/models/transaction";
import { format } from "date-fns";

export const getPaginatedTransactions = (
  page: number,
  pageSize: number,
  filters?: TransactionFilter,
): PaginatedResponse<Transaction> => {
  const db = getDB();
  const offset = (page - 1) * pageSize;

  const transactions = db
    .prepare<unknown[], Transaction>(buildQuery(filters))
    .all(...buildBindings(pageSize, offset, filters));

  const total = getTotalTransactions(filters);

  return {
    data: transactions,
    meta: {
      page,
      page_size: pageSize,
      total,
    },
  };
};

const buildQuery = (filters?: TransactionFilter): string => {
  return `
    SELECT * FROM transactions
    ${filters ? "WHERE date BETWEEN ? AND ?" : ""}
    ORDER BY date DESC
    LIMIT ? OFFSET ?
  `;
};

const buildBindings = (
  pageSize: number,
  offset: number,
  filters?: TransactionFilter,
): unknown[] => {
  const bindings: unknown[] = [pageSize, offset];
  if (filters) {
    bindings.unshift(
      format(filters.date_range.from, "yyyy-MM-dd"),
      format(filters.date_range.to, "yyyy-MM-dd"),
    );
  }

  return bindings;
};
