import { ipcMain, IpcMainInvokeEvent } from "electron";
import { importCsv } from "./csv-import/csv-import";

const handleCsvImport = () => {
  ipcMain.handle("csv:import", (event: IpcMainInvokeEvent, filePath: string) =>
    importCsv(filePath),
  );
};

export const handleMainEvents = () => {
  handleCsvImport();
};
