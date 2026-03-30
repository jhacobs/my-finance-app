import { useQuery } from "@tanstack/react-query";
import { DateRange } from "react-day-picker";
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
import { CreditCard } from "lucide-react";

type TotalBalanceCardProps = {
  dateRange: DateRange | undefined;
};

export default function TotalBalanceCard({ dateRange }: TotalBalanceCardProps) {
  const filters = useTransactionFilter(dateRange);

  const totalBalance = useQuery({
    queryKey: [...queryKeys.balance.totalBalance, filters],
    queryFn: () => window.electronAPI.getTotalBalance(filters),
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Total Balance</CardTitle>
        <CardAction>
          <CreditCard />
        </CardAction>
      </CardHeader>
      <CardContent>
        <p>{nlCurrencyFormatter.format(totalBalance.data ?? 0)}</p>
      </CardContent>
    </Card>
  );
}
