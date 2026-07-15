import { ipcMain, IpcMainInvokeEvent } from "electron";
import { importCsv } from "@/app/csv-import/csv-import";
import { getLatestTransactions } from "@/app/transaction/latest-transactions";
import { getPaginatedTransactions } from "@/app/transaction/paginated-transactions";
import {
  createTransferRule,
  deleteTransferRule,
  getTransferRules,
  updateTransferRule,
} from "@/app/transfer/transfer-rules";
import { TransactionFilter } from "@/models/transaction";
import { getTotalIncome } from "./balance/total-income";
import { getTotalExpense } from "./balance/total-expense";
import { getTotalBalance } from "./balance/total-balance";
import { loginUser } from "./auth/login";
import { registerUser } from "./auth/register";
import { logoutUser } from "./auth/logout";
import { getAppConfig } from "@/config/config";
import { encryptionKeyExists } from "./auth/encryption";
import { getMonthlyCashFlowInsight } from "./insight/monthly-cash-flow";
import { getMonthlyMoneySavedInsight } from "./insight/monthly-money-saved";

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

const handleTotalBalance = () => {
  ipcMain.handle(
    "balance:total",
    (event: IpcMainInvokeEvent, filters?: TransactionFilter) => {
      return getTotalBalance(filters);
    },
  );
};

const handleLoginUser = () => {
  ipcMain.handle(
    "auth:login",
    (event: IpcMainInvokeEvent, password: string) => {
      return loginUser(password);
    },
  );
};

const handleRegisterUser = () => {
  ipcMain.handle(
    "auth:register",
    (event: IpcMainInvokeEvent, password: string) => {
      return registerUser(password);
    },
  );
};

const handleLogoutUser = () => {
  ipcMain.handle("auth:logout", () => {
    logoutUser();
  });
};

const handleOnboardingCompleted = () => {
  ipcMain.handle("app:onboarding-completed", () => {
    return getAppConfig().onboardingCompleted;
  });
};

const handleUserAuthenticated = () => {
  ipcMain.handle("app:user-authenticated", () => {
    return encryptionKeyExists();
  });
};

const handleTransferRules = () => {
  ipcMain.handle("transfer-rules:list", () => getTransferRules());
  ipcMain.handle(
    "transfer-rules:create",
    (_event: IpcMainInvokeEvent, value: string) => createTransferRule(value),
  );
  ipcMain.handle(
    "transfer-rules:update",
    (_event: IpcMainInvokeEvent, id: number, value: string) =>
      updateTransferRule(id, value),
  );
  ipcMain.handle(
    "transfer-rules:delete",
    (_event: IpcMainInvokeEvent, id: number) => deleteTransferRule(id),
  );
};

const handleMonthlyCashFlowInsight = () => {
  ipcMain.handle("insights:monthly-cash-flow", () =>
    getMonthlyCashFlowInsight(),
  );
};

const handleMonthlyMoneySavedInsight = () => {
  ipcMain.handle("insights:monthly-money-saved", () =>
    getMonthlyMoneySavedInsight(),
  );
};

export const handleMainEvents = () => {
  handleCsvImport();
  handleLatestTransactions();
  handlePaginatedTransactions();
  handleTotalIncome();
  handleTotalExpense();
  handleTotalBalance();
  handleLoginUser();
  handleRegisterUser();
  handleLogoutUser();
  handleOnboardingCompleted();
  handleUserAuthenticated();
  handleTransferRules();
  handleMonthlyCashFlowInsight();
  handleMonthlyMoneySavedInsight();
};
