import { ImportCSVResult } from "@/models/csv";
import { PaginatedResponse } from "@/models/responses";
import { Transaction, TransactionFilter } from "@/models/transaction";

declare module "*.css";

type Unsubscribe = () => void;

interface ElectronAPI {
  importCsv: (filePath: string) => Promise<ImportCSVResult>;
  getPathOfFile: (file: File) => string;
  getLatestTransactions: () => Promise<Transaction[]>;
  getPaginatedTransactions: (
    page: number,
    pageSize: number,
    filters?: TransactionFilter,
  ) => Promise<PaginatedResponse<Transaction>>;
  getTotalIncome: (filters?: TransactionFilter) => Promise<number>;
  getTotalExpense: (filters?: TransactionFilter) => Promise<number>;
  getTotalBalance: (filters?: TransactionFilter) => Promise<number>;
  loginUser: (password: string) => Promise<boolean>;
  registerUser: (password: string) => Promise<boolean>;
  logoutUser: () => Promise<void>;
  onboardingCompleted: () => Promise<boolean>;
  userAuthenticated: () => Promise<boolean>;
  onErrorNotification: (callback: (message: string) => void) => void;
  onSuccessNotification: (callback: (message: string) => void) => void;
  onInfoNotification: (callback: (message: string) => void) => void;
  onOnboardingNeeded: (callback: () => void) => Unsubscribe;
  onLoginNeeded: (callback: () => void) => Unsubscribe;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

export {};
