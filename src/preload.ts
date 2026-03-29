import { contextBridge, ipcRenderer, webUtils } from "electron";
import { TransactionFilter } from "@/models/transaction";

contextBridge.exposeInMainWorld("electronAPI", {
  importCsv: (filePath: string) => ipcRenderer.invoke("csv:import", filePath),
  getPathOfFile: (file: File) => webUtils.getPathForFile(file),
  getLatestTransactions: () => ipcRenderer.invoke("transactions:latest"),
  getPaginatedTransactions: (
    page: number,
    pageSize: number,
    filters?: TransactionFilter,
  ) => ipcRenderer.invoke("transactions:paginated", page, pageSize, filters),
  getTotalIncome: (filters?: TransactionFilter) =>
    ipcRenderer.invoke("balance:income", filters),
  getTotalExpense: (filters?: TransactionFilter) =>
    ipcRenderer.invoke("balance:expense", filters),
});
