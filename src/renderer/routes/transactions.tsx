import { createFileRoute } from "@tanstack/react-router";
import PaginatedTransactionsTable from "@/renderer/components/transactions-table";
import { authMiddleware } from "@/renderer/auth/middleware";
import MainLayout from "../layout/main-layout";

export const Route = createFileRoute("/transactions")({
  component: Transactions,
  beforeLoad: async () => {
    await authMiddleware();
  },
});

function Transactions() {
  return (
    <MainLayout>
      <PaginatedTransactionsTable />
    </MainLayout>
  );
}
