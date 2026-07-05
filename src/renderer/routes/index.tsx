import { createFileRoute } from "@tanstack/react-router";
import RecentTransactions from "@/renderer/components/recent-transactions";
import ImportCSV from "@/renderer/components/import-csv";
import DateFilters from "../components/date-filters";
import { useState } from "react";
import { DateRange } from "react-day-picker";
import TotalIncomeCard from "@/renderer/components/total-income-card";
import TotalExpenseCard from "@/renderer/components/total-expense-card";
import TotalBalanceCard from "@/renderer/components/total-balance-card";
import { authMiddleware } from "@/renderer/auth/middleware";
import MainLayout from "../layout/main-layout";

export const Route = createFileRoute("/")({
  component: Index,
  beforeLoad: async () => {
    await authMiddleware();
  },
});

function Index() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  return (
    <MainLayout>
      <DateFilters
        className="mb-3"
        onChange={setDateRange}
        defaultSelectedFilter="this_month"
      ></DateFilters>

      <div className="grid grid-cols-3 gap-4 mb-4">
        {dateRange && (
          <>
            <TotalBalanceCard dateRange={dateRange} />
            <TotalIncomeCard dateRange={dateRange} />
            <TotalExpenseCard dateRange={dateRange} />
          </>
        )}
      </div>

      <div className="flex gap-4">
        <RecentTransactions />
        <ImportCSV />
      </div>
    </MainLayout>
  );
}
