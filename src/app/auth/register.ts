import { getAppConfig, updateAppConfig } from "@/config/config";
import { generateEncryptionKeys } from "./encryption";
import { sendLoginNeededEvent, sendNotificationEvent } from "@/main";

export const registerUser = async (password: string): Promise<boolean> => {
  if (passwordAlreadyExists()) {
    sendNotificationEvent(
      "error",
      "A password already exists. Please log in instead.",
    );
    sendLoginNeededEvent();
    return false;
  }

  await generateEncryptionKeys(password);
  updateAppConfig("onboardingCompleted", true);
  return true;
};

export const passwordAlreadyExists = (): boolean => {
  const config = getAppConfig();
  return config.passwordHash !== null;
};
