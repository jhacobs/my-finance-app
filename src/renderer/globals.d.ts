import { ImportCSVResult } from "@/models/csv";
import { PaginatedResponse } from "@/models/responses";
import { Transaction, TransactionFilter } from "@/models/transaction";
import {
  TransferRule,
  TransferRuleMutationResult,
} from "@/models/transfer-rule";
import { MonthlyCashFlowPoint } from "@/models/insight";

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
  getMonthlyCashFlowInsight: () => Promise<MonthlyCashFlowPoint[]>;
  loginUser: (password: string) => Promise<boolean>;
  registerUser: (password: string) => Promise<boolean>;
  logoutUser: () => Promise<void>;
  onboardingCompleted: () => Promise<boolean>;
  userAuthenticated: () => Promise<boolean>;
  getTransferRules: () => Promise<TransferRule[]>;
  createTransferRule: (value: string) => Promise<TransferRuleMutationResult>;
  updateTransferRule: (
    id: number,
    value: string,
  ) => Promise<TransferRuleMutationResult>;
  deleteTransferRule: (id: number) => Promise<TransferRuleMutationResult>;
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
