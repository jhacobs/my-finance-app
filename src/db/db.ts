import { app } from "electron";
import { join } from "path";
import fs from "node:fs";
import Database from "better-sqlite3";
import { createMigrationsTable } from "./migration";

let db: Database.Database | undefined = undefined;

const connectToDatabase = () => {
  const isProd = app.isPackaged;
  const dbFilename = process.env.DB_FILENAME;
  let shouldCreateMigrationsTable = false;

  if (!dbFilename) {
    throw new Error(
      "DB_FILENAME environment variable is not defined. Please add it to your .env file.",
    );
  }

  const dbPath = isProd
    ? join(app.getPath("userData"), dbFilename)
    : join(process.cwd(), "src/db", dbFilename);

  if (!fs.existsSync(dbPath)) {
    shouldCreateMigrationsTable = true;
  }

  const db = new Database(dbPath);

  db.pragma("journal_mode = WAL");

  if (shouldCreateMigrationsTable) {
    createMigrationsTable(db);
  }

  return db;
};

export const getDB = () => {
  if (!db) {
    db = connectToDatabase();
  }

  return db;
};
