import { getDB } from "@/db/db";
import { MonthlyCashFlowPoint } from "@/models/insight";
import {
  addMonths,
  endOfMonth,
  format,
  startOfMonth,
  subMonths,
} from "date-fns";

type MonthlyCashFlowRow = {
  month: string;
  transactionType: "income" | "expense";
  totalInCents: number;
};

export const getMonthlyCashFlowInsight = (
  now = new Date(),
): MonthlyCashFlowPoint[] => {
  const db = getDB();
  const firstMonth = startOfMonth(subMonths(now, 11));
  const lastMonth = endOfMonth(now);

  const rows = db
    .prepare<[string, string], MonthlyCashFlowRow>(
      `
      SELECT
        strftime('%Y-%m', date) AS month,
        transaction_type AS transactionType,
        SUM(amount_in_cents) AS totalInCents
      FROM transactions
      WHERE is_transfer = 0
        AND date BETWEEN ? AND ?
        AND transaction_type IN ('income', 'expense')
      GROUP BY month, transaction_type
      ORDER BY month ASC
    `,
    )
    .all(format(firstMonth, "yyyy-MM-dd"), format(lastMonth, "yyyy-MM-dd"));

  const totalsByMonth = new Map<
    string,
    { incomeInCents: number; expenseInCents: number }
  >();

  for (const row of rows) {
    const totals = totalsByMonth.get(row.month) ?? {
      incomeInCents: 0,
      expenseInCents: 0,
    };

    if (row.transactionType === "income") {
      totals.incomeInCents = row.totalInCents;
    } else {
      totals.expenseInCents = row.totalInCents;
    }

    totalsByMonth.set(row.month, totals);
  }

  return Array.from({ length: 12 }, (_, index) => {
    const month = format(addMonths(firstMonth, index), "yyyy-MM");
    const totals = totalsByMonth.get(month) ?? {
      incomeInCents: 0,
      expenseInCents: 0,
    };

    return {
      month,
      ...totals,
      netCashFlowInCents: totals.incomeInCents - totals.expenseInCents,
    };
  });
};
