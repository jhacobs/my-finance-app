import { ipcMain, IpcMainInvokeEvent } from "electron";
import { importCsv } from "./csv-import/csv-import";
import { getLatestTransactions } from "./transaction/latest-transactions";

const handleCsvImport = () => {
  ipcMain.handle("csv:import", (event: IpcMainInvokeEvent, filePath: string) =>
    importCsv(filePath),
  );
};

const handleLatestTransactions = () => {
  ipcMain.handle("transactions:latest", () => getLatestTransactions());
};

export const handleMainEvents = () => {
  handleCsvImport();
  handleLatestTransactions();
};
