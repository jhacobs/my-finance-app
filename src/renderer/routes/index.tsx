import { createFileRoute } from "@tanstack/react-router";
import RecentTransactions from "../components/recent-transactions";
import ImportCSV from "../components/import-csv";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <>
      <div className="flex gap-4">
        <RecentTransactions />
        <ImportCSV />
      </div>
    </>
  );
}
