import { ipcMain, IpcMainInvokeEvent } from "electron";
import { importCsv } from "@/app/csv-import/csv-import";
import { getLatestTransactions } from "@/app/transaction/latest-transactions";
import { getPaginatedTransactions } from "@/app/transaction/paginated-transactions";
import { TransactionFilter } from "@/models/transaction";
import { getTotalIncome } from "./balance/total-income";
import { getTotalExpense } from "./balance/total-expense";

const handleCsvImport = () => {
  ipcMain.handle("csv:import", (event: IpcMainInvokeEvent, filePath: string) =>
    importCsv(filePath),
  );
};

const handleLatestTransactions = () => {
  ipcMain.handle("transactions:latest", () => getLatestTransactions());
};

const handlePaginatedTransactions = () => {
  ipcMain.handle(
    "transactions:paginated",
    (
      event: IpcMainInvokeEvent,
      page: number,
      pageSize: number,
      filters?: TransactionFilter,
    ) => getPaginatedTransactions(page, pageSize, filters),
  );
};

const handleTotalIncome = () => {
  ipcMain.handle(
    "balance:income",
    (event: IpcMainInvokeEvent, filters?: TransactionFilter) => {
      return getTotalIncome(filters);
    },
  );
};

const handleTotalExpense = () => {
  ipcMain.handle(
    "balance:expense",
    (event: IpcMainInvokeEvent, filters?: TransactionFilter) => {
      return getTotalExpense(filters);
    },
  );
};

export const handleMainEvents = () => {
  handleCsvImport();
  handleLatestTransactions();
  handlePaginatedTransactions();
  handleTotalIncome();
  handleTotalExpense();
};
