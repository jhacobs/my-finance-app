import { TrendingUp } from "lucide-react";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/renderer/api/query-keys";
import { DateRange } from "react-day-picker";
import { useTransactionFilter } from "../hooks/use-transaction-filter";
import { nlCurrencyFormatter } from "../helpers/number-format";

type TotalIncomeCardProps = {
  dateRange: DateRange | undefined;
};

export default function TotalIncomeCard({ dateRange }: TotalIncomeCardProps) {
  const filters = useTransactionFilter(dateRange);

  const totalIncome = useQuery({
    queryKey: [...queryKeys.balance.totalIncome, filters],
    queryFn: () => window.electronAPI.getTotalIncome(filters),
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Total Income</CardTitle>
        <CardAction>
          <TrendingUp />
        </CardAction>
      </CardHeader>
      <CardContent>
        <p>{nlCurrencyFormatter.format(totalIncome.data ?? 0)}</p>
      </CardContent>
    </Card>
  );
}
