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
      beginAtZero: true,
      ticks: {
        callback: (value) => formatCents(Number(value)),
      },
    },
  },
};

export default function MonthlyMoneySavedChart() {
  const query = useQuery({
    queryKey: queryKeys.insights.monthlyMoneySaved(),
    queryFn: () => window.electronAPI.getMonthlyMoneySavedInsight(),
  });

  const content = (() => {
    if (query.isPending) {
      return <Skeleton className="h-96 w-full" />;
    }

    if (query.isError) {
      return (
        <p className="text-destructive" role="alert">
          Could not load money saved.
        </p>
      );
    }

    if (query.data.every(({ savedInCents }) => savedInCents === 0)) {
      return (
        <p className="flex h-96 items-center justify-center text-muted-foreground">
          No outgoing transfers for this period.
        </p>
      );
    }

    const data: ChartData<"line"> = {
      labels: query.data.map(({ month }) =>
        format(parse(month, "yyyy-MM", new Date()), "MMM"),
      ),
      datasets: [
        {
          label: "Outgoing transfers",
          data: query.data.map(({ savedInCents }) => savedInCents),
          borderColor: "#3b82f6",
          backgroundColor: "#3b82f6",
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
        <CardTitle>Money saved</CardTitle>
      </CardHeader>
      <CardContent>{content}</CardContent>
    </Card>
  );
}
