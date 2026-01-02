import Database from "better-sqlite3";
import fs from "node:fs";
import { join } from "node:path";

type MigrationRow = {
  migration: string;
  batch: number;
};

const migrationFolder = join(process.cwd(), "src/db/migrations/");

const getMigratedMigrations = (db: Database.Database): MigrationRow[] => {
  const statement = db.prepare<unknown[], MigrationRow>(
    "SELECT migration, batch FROM migrations",
  );

  return statement.all();
};

const registerMigration = (db: Database.Database, fileName: string) => {
  const getBatchStatement = db.prepare<unknown[], { batch: number }>(
    "SELECT MAX(batch) as batch FROM migrations",
  );
  const insertStatement = db.prepare<[string, number]>(
    "INSERT INTO migrations (migration, batch) VALUES (?, ?)",
  );
  const row = getBatchStatement.get();

  insertStatement.run(fileName, (row?.batch ?? 0) + 1);
};

const migrateMigration = (db: Database.Database, fileName: string) => {
  const migrationSql = fs
    .readFileSync(`${migrationFolder}${fileName}.sql`)
    .toString();
  const sqlQueries = migrationSql.split(";").filter((query) => query.trim());

  db.transaction(() => {
    for (const query of sqlQueries) {
      db.prepare(query).run();
    }
  })();

  registerMigration(db, fileName);
};

export const createMigrationsTable = (db: Database.Database) => {
  const statement = db.prepare(`
    CREATE TABLE migrations (
      id INTEGER PRIMARY KEY NOT NULL,
      migration VARCHAR(255) NOT NULL,
      batch INTEGER NOT NULL
    )
  `);

  statement.run();
};

export const executeMigrations = (db: Database.Database) => {
  const foundMigrationFiles = fs
    .readdirSync(migrationFolder, { withFileTypes: true })
    .filter((item) => item.isFile() && item.name.endsWith(".sql"))
    .map((file) => file.name.replace(".sql", ""));

  const migratedMigrations = getMigratedMigrations(db);

  for (const fileName of foundMigrationFiles) {
    if (!migratedMigrations.some((m) => m.migration === fileName)) {
      migrateMigration(db, fileName);
    }
  }
};
