import { getDB } from "@/db/db";
import { Transaction } from "@/models/transaction";

export const getLatestTransactions = (): Transaction[] => {
  const db = getDB();
  const totalTransactionsToRetrieve = 5;

  return db
    .prepare<unknown[], Transaction>(
      `
      SELECT * FROM transactions
      ORDER BY date DESC
      LIMIT ?
      `,
    )
    .all(totalTransactionsToRetrieve);
};
