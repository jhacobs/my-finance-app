import { ImportCSVResult } from "@/models/csv";
import { PaginatedResponse } from "@/models/responses";
import { Transaction, TransactionFilter } from "@/models/transaction";

declare module "*.css";

interface ElectronAPI {
  importCsv: (filePath: string) => Promise<ImportCSVResult>;
  getPathOfFile: (file: File) => string;
  getLatestTransactions: () => Promise<Transaction[]>;
  getPaginatedTransactions: (
    page: number,
    pageSize: number,
    filters?: TransactionFilter,
  ) => Promise<PaginatedResponse<Transaction>>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

export {};
