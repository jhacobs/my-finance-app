import { getAppConfig, updateAppConfigValues } from "@/config/config";
import * as argon2 from "argon2";
import crypto from "crypto";

const MASTER_KEY_SALT_BYTES = 16;
const ENCRYPTION_KEY_BYTES = 32;
const GCM_INITIALIZATION_VECTOR_BYTES = 12;
const GCM_AUTH_TAG_BYTES = 16;
const PROTECTED_KEY_CIPHER = "aes-256-gcm";

export let encryptionKey: Buffer | undefined = undefined;

export const decryptProtectedEncryptionKey = async (
  password: string,
): Promise<void> => {
  const config = getAppConfig();

  if (!config.protectedEncryptionKey) {
    throw new Error("Protected encryption key not found in config.");
  }

  if (!config.masterKeySalt) {
    throw new Error("Master key salt not found in config.");
  }

  const masterKey = await generateMasterKey(password, config.masterKeySalt);

  try {
    encryptionKey = decryptEncryptionKey(
      config.protectedEncryptionKey,
      masterKey,
    );
  } finally {
    masterKey.fill(0); // Clear master key from memory
  }
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
  const masterKeySalt = crypto
    .randomBytes(MASTER_KEY_SALT_BYTES)
    .toString("hex");
  const masterKey = await generateMasterKey(password, masterKeySalt);

  try {
    updateAppConfigValues({
      masterKeySalt,
      passwordHash: await createMasterKeyHash(masterKey),
      protectedEncryptionKey: generateProtectedEncryptionKey(masterKey),
    });
  } finally {
    masterKey.fill(0); // Clear master key from memory
  }
};

export const generateMasterKey = async (
  password: string,
  saltHex?: string | null,
): Promise<Buffer> => {
  if (!saltHex) {
    throw new Error("Salt hex is required.");
  }

  return (await argon2.hash(password, {
    raw: true,
    salt: Buffer.from(saltHex, "hex"),
  })) as Buffer;
};

const createMasterKeyHash = async (masterKey: Buffer): Promise<string> => {
  return await argon2.hash(masterKey.toString("hex"));
};

const generateProtectedEncryptionKey = (masterKey: Buffer): string => {
  const generatedEncryptionKey = crypto.randomBytes(ENCRYPTION_KEY_BYTES);

  try {
    return createProtectedEncryptionKey(masterKey, generatedEncryptionKey);
  } finally {
    generatedEncryptionKey.fill(0);
  }
};

const createProtectedEncryptionKey = (
  masterKey: Buffer,
  generatedEncryptionKey: Buffer,
): string => {
  const initializationVector = crypto.randomBytes(
    GCM_INITIALIZATION_VECTOR_BYTES,
  );

  const cipher = crypto.createCipheriv(
    PROTECTED_KEY_CIPHER,
    masterKey,
    initializationVector,
    { authTagLength: GCM_AUTH_TAG_BYTES },
  );

  const protectedEncryptionKey = Buffer.concat([
    cipher.update(generatedEncryptionKey),
    cipher.final(),
  ]).toString("hex");

  const authTag = cipher.getAuthTag();

  return [
    "gcm",
    initializationVector.toString("hex"),
    protectedEncryptionKey,
    authTag.toString("hex"),
  ].join(":");
};

const decryptEncryptionKey = (
  protectedEncryptionKeyWithIV: string,
  masterKey: Buffer,
): Buffer => {
  const parts = protectedEncryptionKeyWithIV.split(":");

  if (parts[0] !== "gcm") {
    throw new Error("Protected encryption key has an unsupported format.");
  }

  const [, ivHex, protectedKeyHex, authTagHex] = parts;
  if (!ivHex || !protectedKeyHex || !authTagHex) {
    throw new Error("Protected encryption key has an invalid GCM format.");
  }

  const decipher = crypto.createDecipheriv(
    PROTECTED_KEY_CIPHER,
    masterKey,
    Buffer.from(ivHex, "hex"),
    { authTagLength: GCM_AUTH_TAG_BYTES },
  );
  decipher.setAuthTag(Buffer.from(authTagHex, "hex"));

  return Buffer.concat([
    decipher.update(Buffer.from(protectedKeyHex, "hex")),
    decipher.final(),
  ]);
};
