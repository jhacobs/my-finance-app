declare module "*.css";

interface ElectronAPI {
  importCsv: (filePath: string) => Promise<boolean>;
  getPathOfFile: (file: File) => string;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

export {};
