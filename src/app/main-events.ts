import { ipcMain, IpcMainInvokeEvent } from "electron";
import { importCsv } from "@/app/csv-import/csv-import";
import { getLatestTransactions } from "@/app/transaction/latest-transactions";
import { getPaginatedTransactions } from "@/app/transaction/paginated-transactions";
import { TransactionFilter } from "@/models/transaction";

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

export const handleMainEvents = () => {
  handleCsvImport();
  handleLatestTransactions();
  handlePaginatedTransactions();
};
