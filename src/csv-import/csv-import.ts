import { getDB } from "@/db/db";
import { CsvError, parse } from "csv-parse";
import fs from "node:fs";
import type { Transaction } from "@/models/transaction";

type TransactionCsvRecord = {
  Datum: string;
  "Naam / Omschrijving": string;
  Rekening: string;
  Tegenrekening: string;
  Code: string;
  "Af Bij": string;
  "Bedrag (EUR)": string;
  Mutatiesoort: string;
  Mededelingen: string;
  "Saldo na mutatie": string;
  Tag: string;
};

export const importCsv = async (filePath: string): Promise<boolean> => {
  const data = await readCsv(filePath);
  const normalizedCsvData = normalizeCsvData(data);
  storeTransactions(normalizedCsvData);
  return true;
};

const readCsv = (filePath: string): Promise<TransactionCsvRecord[]> => {
  return new Promise((resolve, reject) => {
    const content = fs.readFileSync(filePath);

    parse(
      content,
      {
        columns: true,
        skip_empty_lines: true,
        trim: true,
        delimiter: ";",
      },
      (err: CsvError | undefined, records: TransactionCsvRecord[]) => {
        if (err) {
          reject(err);
        } else {
          resolve(records);
        }
      },
    );
  });
};

const normalizeCsvData = (data: TransactionCsvRecord[]): Transaction[] => {
  return data.map((record) => {
    return {
      id: 0,
      date: record.Datum,
      description: record["Naam / Omschrijving"],
      account: record.Rekening,
      to_account: record.Tegenrekening,
      code: record.Code,
      transaction_type: record["Af Bij"] === "Bij" ? "income" : "expense",
      amount_in_cents: Math.round(
        parseFloat(record["Bedrag (EUR)"].replace(",", ".")) * 100,
      ),
      mutation_type: record.Mutatiesoort,
      remarks: record.Mededelingen,
      amount_after_transaction_in_cents: Math.round(
        parseFloat(record["Saldo na mutatie"].replace(",", ".")) * 100,
      ),
      tag: record.Tag,
    } satisfies Transaction;
  });
};

const storeTransactions = (transactions: Transaction[]): void => {
  // TODO: Handle duplicates
  const db = getDB();

  const insertStmt = db.prepare(
    `INSERT INTO transactions
    (date, description, account, to_account, code, transaction_type, amount_in_cents, mutation_type, remarks, amount_after_transaction_in_cents, tag)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  );

  const insertTransactions = db.transaction((transactions: Transaction[]) => {
    for (const transaction of transactions) {
      insertStmt.run(
        transaction.date,
        transaction.description,
        transaction.account,
        transaction.to_account,
        transaction.code,
        transaction.transaction_type,
        transaction.amount_in_cents,
        transaction.mutation_type,
        transaction.remarks,
        transaction.amount_after_transaction_in_cents,
        transaction.tag,
      );
    }
  });

  insertTransactions(transactions);
};
