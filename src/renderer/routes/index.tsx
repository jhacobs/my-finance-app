import { createFileRoute } from "@tanstack/react-router";
import RecentTransactions from "@/renderer/components/recent-transactions";
import ImportCSV from "@/renderer/components/import-csv";
import DateFilters from "../components/date-filters";
import { useState } from "react";
import { DateRange } from "react-day-picker";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  return (
    <>
      <DateFilters className="mb-3" onChange={setDateRange}></DateFilters>

      <div className="flex gap-4">
        <RecentTransactions />
        <ImportCSV />
      </div>
    </>
  );
}
