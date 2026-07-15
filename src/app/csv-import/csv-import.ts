import { getDB } from "@/db/db";
import { CsvError, parse } from "csv-parse";
import fs from "node:fs";
import type { Transaction } from "@/models/transaction";
import { ImportCSVResult } from "@/models/csv";
import {
  getTransferRules,
  isTransferDescription,
} from "@/app/transfer/transfer-rules";
import { TransferRule } from "@/models/transfer-rule";

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

export const importCsv = async (filePath: string): Promise<ImportCSVResult> => {
  try {
    const data = await readCsv(filePath);
    const normalizedCsvData = normalizeCsvData(data, getTransferRules());
    const result = storeTransactions(normalizedCsvData);

    return {
      success: true,
      ...result,
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof CsvError
          ? `CSV Parsing Error: ${error.message}`
          : "An unexpected error occurred during CSV import.",
    };
  }
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

const normalizeCsvData = (
  data: TransactionCsvRecord[],
  transferRules: TransferRule[],
): Transaction[] => {
  return data.map((record) => {
    const rawDate = record.Datum;
    const formattedDate =
      rawDate && rawDate.length === 8
        ? `${rawDate.slice(0, 4)}-${rawDate.slice(4, 6)}-${rawDate.slice(6, 8)}`
        : rawDate;

    return {
      id: 0,
      date: formattedDate,
      description: record["Naam / Omschrijving"],
      account: record.Rekening,
      to_account: record.Tegenrekening,
      code: record.Code,
      transaction_type: record["Af Bij"] === "Bij" ? "income" : "expense",
      is_transfer: isTransferDescription(
        record["Naam / Omschrijving"],
        transferRules,
      ),
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

const storeTransactions = (
  transactions: Transaction[],
): { insertedCount: number; skippedCount: number } => {
  const db = getDB();

  const insertStmt = db.prepare(
    `INSERT INTO transactions
    (date, description, account, to_account, code, transaction_type, is_transfer, amount_in_cents, mutation_type, remarks, amount_after_transaction_in_cents, tag)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  );

  const insertTransactions = db.transaction((transactions: Transaction[]) => {
    let insertedCount = 0;

    for (const transaction of transactions) {
      const result = insertStmt.run(
        transaction.date,
        transaction.description,
        transaction.account,
        transaction.to_account,
        transaction.code,
        transaction.transaction_type,
        Number(transaction.is_transfer),
        transaction.amount_in_cents,
        transaction.mutation_type,
        transaction.remarks,
        transaction.amount_after_transaction_in_cents,
        transaction.tag,
      );

      insertedCount += result.changes;
    }

    return {
      insertedCount,
      skippedCount: transactions.length - insertedCount,
    };
  });

  return insertTransactions(transactions);
};
