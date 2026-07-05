import { getAppConfig, updateAppConfig } from "@/config/config";
import * as argon2 from "argon2";
import crypto from "crypto";

const KEY_DERIVATION_SALT = "my-finance-salt";

export let encryptionKey: Buffer | undefined = undefined;

export const decryptProtectedEncryptionKey = async (
  password: string,
): Promise<void> => {
  const config = getAppConfig();

  if (!config.protectedEncryptionKey) {
    throw new Error("Protected encryption key not found in config.");
  }

  const [ivHex, protectedKeyHex] = config.protectedEncryptionKey.split(":");
  const initializationVector = Buffer.from(ivHex, "hex");
  const protectedEncryptionKey = Buffer.from(protectedKeyHex, "hex");

  const masterKey = await generateMasterKey(password);

  const decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    masterKey,
    initializationVector,
  );

  encryptionKey = Buffer.concat([
    decipher.update(protectedEncryptionKey),
    decipher.final(),
  ]);

  masterKey.fill(0); // Clear master key from memory
};

export const clearEncryptionKey = (): void => {
  if (encryptionKey) {
    encryptionKey.fill(0); // Clear encryption key from memory
    encryptionKey = undefined;
  }
};

export const encryptionKeyExists = (): boolean => {
  return encryptionKey ? true : false;
};

export const generateEncryptionKeys = async (
  password: string,
): Promise<void> => {
  const masterKey = await generateMasterKey(password);
  await storeMasterKeyAsHash(masterKey);
  generateProtectedEncryptionKey(masterKey);

  masterKey.fill(0); // Clear master key from memory
};

export const generateMasterKey = async (password: string): Promise<Buffer> => {
  return await argon2.hash(password, {
    raw: true,
    salt: Buffer.from(KEY_DERIVATION_SALT),
  });
};

const storeMasterKeyAsHash = async (masterKey: Buffer): Promise<void> => {
  const hash = await argon2.hash(masterKey.toString("hex"));
  updateAppConfig("passwordHash", hash);
};

const generateProtectedEncryptionKey = (masterKey: Buffer): void => {
  const encryptionKey = crypto.randomBytes(32);
  const initializationVector = crypto.randomBytes(16);

  const cipher = crypto.createCipheriv(
    "aes-256-cbc",
    masterKey,
    initializationVector,
  );

  const protectedEncryptionKey = Buffer.concat([
    cipher.update(encryptionKey),
    cipher.final(),
  ]).toString("hex");

  encryptionKey.fill(0);

  const protectedEncryptionKeyWithIV = `${initializationVector.toString("hex")}:${protectedEncryptionKey}`;

  updateAppConfig("protectedEncryptionKey", protectedEncryptionKeyWithIV);
};
