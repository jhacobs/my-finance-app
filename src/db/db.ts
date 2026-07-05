import { app } from "electron";
import { join } from "path";
import fs from "node:fs";
import Database from "better-sqlite3-multiple-ciphers";
import { createMigrationsTable } from "./migration";
import { encryptionKey } from "@/app/auth/encryption";
import { sendLoginNeededEvent } from "@/main";

let db: Database.Database | undefined = undefined;

const connectToDatabase = () => {
  const isProd = app.isPackaged;
  const dbFilename = "database.sqlite";
  let shouldCreateMigrationsTable = false;

  if (!encryptionKey) {
    sendLoginNeededEvent();
    throw new Error(
      "Encryption key is not available. Please ensure you have completed the authentication process.",
    );
  }

  const dbPath = isProd
    ? join(app.getPath("userData"), dbFilename)
    : join(process.cwd(), "src/db", dbFilename);

  if (!fs.existsSync(dbPath)) {
    shouldCreateMigrationsTable = true;
  }

  const database = new Database(dbPath);

  database.key(encryptionKey); // Set the encryption key for the database
  database.pragma("journal_mode = WAL");

  if (shouldCreateMigrationsTable) {
    createMigrationsTable(database);
  }

  return database;
};

export const getDB = () => {
  if (!db) {
    db = connectToDatabase();
  }

  return db;
};
