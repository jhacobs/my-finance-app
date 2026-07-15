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
  getTotalBalance: (filters?: TransactionFilter) =>
    ipcRenderer.invoke("balance:total", filters),
  getMonthlyCashFlowInsight: () =>
    ipcRenderer.invoke("insights:monthly-cash-flow"),
  getMonthlyMoneySavedInsight: () =>
    ipcRenderer.invoke("insights:monthly-money-saved"),
  loginUser: (password: string) => ipcRenderer.invoke("auth:login", password),
  registerUser: (password: string) =>
    ipcRenderer.invoke("auth:register", password),
  logoutUser: () => ipcRenderer.invoke("auth:logout"),
  onboardingCompleted: () => ipcRenderer.invoke("app:onboarding-completed"),
  userAuthenticated: () => ipcRenderer.invoke("app:user-authenticated"),
  getTransferRules: () => ipcRenderer.invoke("transfer-rules:list"),
  createTransferRule: (value: string) =>
    ipcRenderer.invoke("transfer-rules:create", value),
  updateTransferRule: (id: number, value: string) =>
    ipcRenderer.invoke("transfer-rules:update", id, value),
  deleteTransferRule: (id: number) =>
    ipcRenderer.invoke("transfer-rules:delete", id),
  onErrorNotification: (callback: (message: string) => void) =>
    ipcRenderer.on("notification:error", (_event, message) =>
      callback(message),
    ),
  onSuccessNotification: (callback: (message: string) => void) =>
    ipcRenderer.on("notification:success", (_event, message) =>
      callback(message),
    ),
  onInfoNotification: (callback: (message: string) => void) =>
    ipcRenderer.on("notification:info", (_event, message) => callback(message)),
  onOnboardingNeeded: (callback: () => void) => {
    const listener = () => callback();

    ipcRenderer.on("auth:onboarding-needed", listener);

    return () => {
      ipcRenderer.removeListener("auth:onboarding-needed", listener);
    };
  },
  onLoginNeeded: (callback: () => void) => {
    const listener = () => callback();

    ipcRenderer.on("auth:login-needed", listener);

    return () => {
      ipcRenderer.removeListener("auth:login-needed", listener);
    };
  },
});
