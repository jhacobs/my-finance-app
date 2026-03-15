import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Transaction } from "@/models/transaction";
import { toTitleCase } from "../helpers/string-format";
import { nlCurrencyFormatter } from "../helpers/number-format";
import { formatTransactionAmount } from "../services/transaction-service";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/renderer/api/query-keys";

type RecentTransactionTableProps = {
  transactions: Transaction[];
};

type RecentTransactionTableRow = {
  date: string;
  description: string;
  amount: number;
};

const columnHelper = createColumnHelper<RecentTransactionTableRow>();

const columns = [
  columnHelper.accessor("date", {
    header: "Date",
  }),
  columnHelper.accessor("description", {
    header: "Description",
    cell: (info) => toTitleCase(info.getValue()),
  }),
  columnHelper.accessor("amount", {
    header: "Amount",
    cell: (info) => nlCurrencyFormatter.format(info.getValue()),
  }),
];

const mapTransactionToTableRow = (
  transaction: Transaction,
): RecentTransactionTableRow => {
  return {
    date: transaction.date,
    description: transaction.description,
    amount: formatTransactionAmount(transaction),
  };
};

const RecentTransactionTable = ({
  transactions,
}: RecentTransactionTableProps) => {
  const transactionRows = useMemo(
    () => transactions.map(mapTransactionToTableRow),
    [transactions],
  );

  const table = useReactTable({
    data: transactionRows,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <Table>
      <TableHeader>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <TableHead key={header.id}>
                {header.isPlaceholder
                  ? null
                  : flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
              </TableHead>
            ))}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {table.getRowModel().rows.map((row) => (
          <TableRow key={row.id}>
            {row.getVisibleCells().map((cell) => (
              <TableCell key={cell.id}>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default function RecentTransactions() {
  const query = useQuery({
    queryKey: queryKeys.transactions.recent(),
    queryFn: () => window.electronAPI.getLatestTransactions(),
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent transactions</CardTitle>
      </CardHeader>
      <CardContent>
        {query.isLoading && <p>Loading...</p>}

        {query.data && <RecentTransactionTable transactions={query.data} />}
      </CardContent>
    </Card>
  );
}
