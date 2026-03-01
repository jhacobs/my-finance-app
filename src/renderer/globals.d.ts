import { ImportResult } from "@/csv-import/csv-import";
import { Transaction } from "@/models/transaction";

declare module "*.css";

interface ElectronAPI {
  importCsv: (filePath: string) => Promise<ImportResult>;
  getPathOfFile: (file: File) => string;
  getLatestTransactions: () => Promise<Transaction[]>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

export {};
