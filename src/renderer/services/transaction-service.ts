import { Transaction } from "@/models/transaction";

export const formatTransactionAmount = (transaction: Transaction): number => {
  return transaction.transaction_type === "income"
    ? transaction.amount_in_cents / 100
    : -(transaction.amount_in_cents / 100);
};
