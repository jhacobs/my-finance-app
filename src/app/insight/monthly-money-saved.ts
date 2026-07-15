import { getDB } from "@/db/db";
import { MonthlyMoneySavedPoint } from "@/models/insight";
import {
  addMonths,
  endOfMonth,
  format,
  startOfMonth,
  subMonths,
} from "date-fns";

type MonthlyMoneySavedRow = {
  month: string;
  savedInCents: number;
};

export const getMonthlyMoneySavedInsight = (
  now = new Date(),
): MonthlyMoneySavedPoint[] => {
  const firstMonth = startOfMonth(subMonths(now, 11));
  const lastMonth = endOfMonth(now);

  const rows = getDB()
    .prepare<[string, string], MonthlyMoneySavedRow>(
      `
      SELECT
        strftime('%Y-%m', date) AS month,
        SUM(amount_in_cents) AS savedInCents
      FROM transactions
      WHERE is_transfer = 1
        AND transaction_type = 'expense'
        AND date BETWEEN ? AND ?
      GROUP BY month
      ORDER BY month ASC
      `,
    )
    .all(format(firstMonth, "yyyy-MM-dd"), format(lastMonth, "yyyy-MM-dd"));

  const savedByMonth = new Map(
    rows.map(({ month, savedInCents }) => [month, savedInCents]),
  );

  return Array.from({ length: 12 }, (_, index) => {
    const month = format(addMonths(firstMonth, index), "yyyy-MM");

    return {
      month,
      savedInCents: savedByMonth.get(month) ?? 0,
    };
  });
};
