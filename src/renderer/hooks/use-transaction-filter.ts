import { TransactionFilter } from "@/models/transaction";
import { DateRange } from "react-day-picker";

export function useTransactionFilter(
  dateRange?: DateRange,
): TransactionFilter | undefined {
  return dateRange?.from && dateRange?.to
    ? {
        date_range: {
          from: dateRange.from,
          to: dateRange.to,
        },
      }
    : undefined;
}
