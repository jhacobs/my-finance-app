import { createFileRoute } from "@tanstack/react-router";
import PaginatedTransactionsTable from "@/renderer/components/transactions-table";

export const Route = createFileRoute("/transactions")({
  component: Transactions,
});

function Transactions() {
  return <PaginatedTransactionsTable></PaginatedTransactionsTable>;
}
