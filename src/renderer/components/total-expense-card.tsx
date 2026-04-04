import { useQuery } from "@tanstack/react-query";
import { TrendingDown } from "lucide-react";
import { queryKeys } from "@/renderer/api/query-keys";
import { nlCurrencyFormatter } from "@/renderer/helpers/number-format";
import { useTransactionFilter } from "@/renderer/hooks/use-transaction-filter";
import {
  Card,
  CardHeader,
  CardTitle,
  CardAction,
  CardContent,
} from "./ui/card";
import { DateRange } from "react-day-picker";

type TotalExpenseCardProps = {
  dateRange: DateRange;
};

export default function TotalExpenseCard({ dateRange }: TotalExpenseCardProps) {
  const filters = useTransactionFilter(dateRange);

  const totalExpense = useQuery({
    queryKey: [...queryKeys.balance.totalExpense, filters],
    queryFn: () => window.electronAPI.getTotalExpense(filters),
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Total Expense</CardTitle>
        <CardAction>
          <TrendingDown />
        </CardAction>
      </CardHeader>
      <CardContent>
        <p>{nlCurrencyFormatter.format(totalExpense.data ?? 0)}</p>
      </CardContent>
    </Card>
  );
}
