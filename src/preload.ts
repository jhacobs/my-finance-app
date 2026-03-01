import { contextBridge, ipcRenderer, webUtils } from "electron";

contextBridge.exposeInMainWorld("electronAPI", {
  importCsv: (filePath: string) => ipcRenderer.invoke("csv:import", filePath),
  getPathOfFile: (file: File) => webUtils.getPathForFile(file),
  getLatestTransactions: () => ipcRenderer.invoke("transactions:latest"),
});
