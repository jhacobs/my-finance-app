import { app } from "electron";
import fs from "node:fs";

export type AppConfig = {
  passwordHash: string | null;
  protectedEncryptionKey: string | null;
  masterKeySalt: string | null;
  onboardingCompleted: boolean;
};

const configPath = app.getPath("userData") + "/config.json";

export const initializeAppConfig = (): void => {
  if (!fs.existsSync(configPath)) {
    const defaultConfig: AppConfig = {
      passwordHash: null,
      protectedEncryptionKey: null,
      masterKeySalt: null,
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
  const config = JSON.parse(configContent) as Partial<AppConfig>;

  return {
    passwordHash: config.passwordHash ?? null,
    protectedEncryptionKey: config.protectedEncryptionKey ?? null,
    masterKeySalt: config.masterKeySalt ?? null,
    onboardingCompleted: config.onboardingCompleted ?? false,
  };
};

export const updateAppConfig = <K extends keyof AppConfig>(
  key: K,
  value: AppConfig[K],
): void => {
  const config = getAppConfig();
  config[key] = value;
  fs.writeFileSync(configPath, JSON.stringify(config));
};

export const updateAppConfigValues = (values: Partial<AppConfig>): void => {
  const config = getAppConfig();
  fs.writeFileSync(configPath, JSON.stringify({ ...config, ...values }));
};
