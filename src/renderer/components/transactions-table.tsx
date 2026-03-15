import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  PaginationState,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { toTitleCase } from "@/renderer/helpers/string-format";
import { nlCurrencyFormatter } from "@/renderer/helpers/number-format";
import { Transaction, TransactionFilter } from "@/models/transaction";
import { useMemo, useState } from "react";
import { formatTransactionAmount } from "@/renderer/services/transaction-service";
import { PaginatedResponse } from "@/models/responses";
import PaginationControls from "@/renderer/components/pagination-controls";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/renderer/api/query-keys";
import DateFilters from "@/renderer/components/date-filters";
import { DateRange } from "react-day-picker";

type TransactionsTableProps = {
  transactions: PaginatedResponse<Transaction>;
  pagination: PaginationState;
  setPagination: React.Dispatch<React.SetStateAction<PaginationState>>;
};

type TransactionTableRow = {
  date: string;
  description: string;
  amount: number;
  mutationType: string;
  remarks: string;
};

const columnHelper = createColumnHelper<TransactionTableRow>();

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
  columnHelper.accessor("mutationType", {
    header: "Mutation Type",
  }),
];

const mapTransactionToTableRow = (
  transaction: Transaction,
): TransactionTableRow => {
  return {
    date: transaction.date,
    description: transaction.description,
    amount: formatTransactionAmount(transaction),
    mutationType: transaction.transaction_type,
    remarks: transaction.remarks || "",
  };
};

const TransactionsTable = ({
  transactions,
  pagination,
  setPagination,
}: TransactionsTableProps) => {
  const transactionRows = useMemo(
    () => transactions.data.map(mapTransactionToTableRow),
    [transactions],
  );

  const table = useReactTable({
    data: transactionRows,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    rowCount: transactions.meta.total,
    state: {
      pagination,
    },
    onPaginationChange: setPagination,
  });

  return (
    <>
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
      <PaginationControls table={table}></PaginationControls>
    </>
  );
};

export default function PaginatedTransactionsTable() {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 15,
  });

  const [filters, setFilters] = useState<TransactionFilter | undefined>(
    undefined,
  );

  const transactions = useQuery({
    queryKey: [
      ...queryKeys.transactions.index,
      pagination.pageIndex,
      pagination.pageSize,
      filters,
    ] as const,
    queryFn: () =>
      window.electronAPI.getPaginatedTransactions(
        pagination.pageIndex + 1,
        pagination.pageSize,
        filters,
      ),
  });

  const updateDateFilters = (dateRange: DateRange) => {
    if (!dateRange.from || !dateRange.to) {
      setFilters(undefined);
      return;
    }

    setFilters({
      date_range: {
        from: dateRange.from,
        to: dateRange.to,
      },
    });
  };

  return (
    <>
      <DateFilters onChange={updateDateFilters} className="mb-3" />

      {transactions.data && (
        <TransactionsTable
          key={`${pagination.pageIndex}-${pagination.pageSize}`}
          transactions={transactions.data}
          pagination={pagination}
          setPagination={setPagination}
        ></TransactionsTable>
      )}
    </>
  );
}
