import { getAppConfig } from "@/config/config";
import * as argon2 from "argon2";
import { decryptProtectedEncryptionKey, generateMasterKey } from "./encryption";
import { getDB } from "@/db/db";
import { executeMigrations } from "@/db/migration";
import { sendNotificationEvent, sendOnboardingNeededEvent } from "@/main";

export const loginUser = async (password: string): Promise<boolean> => {
  const config = getAppConfig();

  if (!config.passwordHash || !config.onboardingCompleted) {
    sendNotificationEvent(
      "error",
      "You are not registered yet. Please complete the onboarding process.",
    );
    sendOnboardingNeededEvent();
    return false;
  }

  const isValid = await validateUser(password, config.passwordHash);

  if (!isValid) {
    return false;
  }

  await decryptProtectedEncryptionKey(password);
  const db = getDB();
  executeMigrations(db);
  return true;
};

const validateUser = async (
  password: string,
  passwordHash: string,
): Promise<boolean> => {
  try {
    const masterKey = await generateMasterKey(password);
    const isValid = await argon2.verify(
      passwordHash,
      masterKey.toString("hex"),
    );
    masterKey.fill(0); // Clear master key from memory
    return isValid;
  } catch (error) {
    console.error("Error verifying password:", error);
    return false;
  }
};
