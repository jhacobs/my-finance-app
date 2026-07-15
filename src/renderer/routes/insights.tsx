import { createFileRoute } from "@tanstack/react-router";
import { authMiddleware } from "@/renderer/auth/middleware";
import MonthlyCashFlowChart from "@/renderer/components/monthly-cash-flow-chart";
import MainLayout from "@/renderer/layout/main-layout";

export const Route = createFileRoute("/insights")({
  component: Insights,
  beforeLoad: async () => {
    await authMiddleware();
  },
});

function Insights() {
  return (
    <MainLayout>
      <section aria-labelledby="insights-heading">
        <h2 id="insights-heading" className="mb-4 text-2xl font-semibold">
          Insights
        </h2>
        <div className="grid gap-4">
          <MonthlyCashFlowChart />
        </div>
      </section>
    </MainLayout>
  );
}
