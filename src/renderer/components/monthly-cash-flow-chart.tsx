import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
  type ChartData,
  type ChartOptions,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { useQuery } from "@tanstack/react-query";
import { format, parse } from "date-fns";
import { queryKeys } from "@/renderer/api/query-keys";
import { nlCurrencyFormatter } from "@/renderer/helpers/number-format";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/renderer/components/ui/card";
import { Skeleton } from "@/renderer/components/ui/skeleton";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
);

const formatCents = (value: number) => nlCurrencyFormatter.format(value / 100);

const options: ChartOptions<"line"> = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: { mode: "index", intersect: false },
  plugins: {
    legend: { labels: { usePointStyle: true } },
    tooltip: {
      callbacks: {
        label: (context) =>
          `${context.dataset.label}: ${formatCents(context.parsed.y ?? 0)}`,
      },
    },
  },
  scales: {
    y: {
      ticks: {
        callback: (value) => formatCents(Number(value)),
      },
    },
  },
};

export default function MonthlyCashFlowChart() {
  const query = useQuery({
    queryKey: queryKeys.insights.monthlyCashFlow(),
    queryFn: () => window.electronAPI.getMonthlyCashFlowInsight(),
  });

  const content = (() => {
    if (query.isPending) {
      return <Skeleton className="h-96 w-full" />;
    }

    if (query.isError) {
      return (
        <p className="text-destructive" role="alert">
          Could not load monthly cash flow.
        </p>
      );
    }

    const hasTransactions = query.data.some(
      ({ incomeInCents, expenseInCents }) =>
        incomeInCents !== 0 || expenseInCents !== 0,
    );

    if (!hasTransactions) {
      return (
        <p className="flex h-96 items-center justify-center text-muted-foreground">
          No transaction data for this period.
        </p>
      );
    }

    const data: ChartData<"line"> = {
      labels: query.data.map(({ month }) =>
        format(parse(month, "yyyy-MM", new Date()), "MMM"),
      ),
      datasets: [
        {
          label: "Income",
          data: query.data.map(({ incomeInCents }) => incomeInCents),
          borderColor: "#34d399",
          backgroundColor: "#34d399",
          pointRadius: 3,
          tension: 0.25,
        },
        {
          label: "Expenses",
          data: query.data.map(({ expenseInCents }) => expenseInCents),
          borderColor: "#f59e0b",
          backgroundColor: "#f59e0b",
          pointRadius: 3,
          tension: 0.25,
        },
        {
          label: "Net cash flow",
          data: query.data.map(({ netCashFlowInCents }) => netCashFlowInCents),
          borderColor: "#8b5cf6",
          backgroundColor: "#8b5cf6",
          pointRadius: 3,
          tension: 0.25,
        },
      ],
    };

    return (
      <div className="h-96">
        <Line data={data} options={options} />
      </div>
    );
  })();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Income, expenses and net cash flow</CardTitle>
      </CardHeader>
      <CardContent>{content}</CardContent>
    </Card>
  );
}
