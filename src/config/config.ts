import { app } from "electron";
import fs from "node:fs";

export type AppConfig = {
  passwordHash: string | null;
  protectedEncryptionKey: string | null;
  onboardingCompleted: boolean;
};

const configPath = app.getPath("userData") + "/config.json";

export const initializeAppConfig = (): void => {
  if (!fs.existsSync(configPath)) {
    const defaultConfig: AppConfig = {
      passwordHash: null,
      protectedEncryptionKey: null,
      onboardingCompleted: false,
    };

    fs.writeFileSync(configPath, JSON.stringify(defaultConfig));
  }
};

export const getAppConfig = (): AppConfig => {
  if (!fs.existsSync(configPath)) {
    throw new Error("Config file not found. Please initialize the app config.");
  }

  const configContent = fs.readFileSync(configPath, "utf-8");
  return JSON.parse(configContent) as AppConfig;
};

export const updateAppConfig = <K extends keyof AppConfig>(
  key: K,
  value: AppConfig[K],
): void => {
  const config = getAppConfig();
  config[key] = value;
  fs.writeFileSync(configPath, JSON.stringify(config));
};
