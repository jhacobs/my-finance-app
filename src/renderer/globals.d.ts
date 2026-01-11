import { ImportResult } from "@/csv-import/csv-import";

declare module "*.css";

interface ElectronAPI {
  importCsv: (filePath: string) => Promise<ImportResult>;
  getPathOfFile: (file: File) => string;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

export {};
