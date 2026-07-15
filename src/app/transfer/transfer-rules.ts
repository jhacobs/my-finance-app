import { getDB } from "@/db/db";
import {
  TransferRule,
  TransferRuleMutationResult,
} from "@/models/transfer-rule";

const normalizeRuleValue = (value: string): string => value.trim();

const normalizeForMatching = (value: string): string =>
  value.toLocaleLowerCase();

const validateRuleValue = (
  value: string,
  excludedRuleId?: number,
): { success: true; value: string } | { success: false; error: string } => {
  const normalizedValue = normalizeRuleValue(value);

  if (!normalizedValue) {
    return { success: false, error: "Enter a description fragment." };
  }

  const duplicate = getDB()
    .prepare<unknown[], Pick<TransferRule, "id" | "value">>(
      "SELECT id, value FROM transfer_rules",
    )
    .all()
    .some(
      (rule) =>
        rule.id !== excludedRuleId &&
        normalizeForMatching(normalizeRuleValue(rule.value)) ===
          normalizeForMatching(normalizedValue),
    );

  if (duplicate) {
    return { success: false, error: "This transfer rule already exists." };
  }

  return { success: true, value: normalizedValue };
};

const reclassifyTransactions = (): void => {
  const rules = getTransferRules();
  const transactions = getDB()
    .prepare<
      unknown[],
      { id: number; description: string; is_transfer: number }
    >("SELECT id, description, is_transfer FROM transactions")
    .all();
  const updateTransaction = getDB().prepare<[number, number]>(
    `UPDATE transactions
     SET is_transfer = ?, updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
  );

  for (const transaction of transactions) {
    const isTransfer = isTransferDescription(transaction.description, rules)
      ? 1
      : 0;

    if (transaction.is_transfer !== isTransfer) {
      updateTransaction.run(isTransfer, transaction.id);
    }
  }
};

export const getTransferRules = (): TransferRule[] => {
  return getDB()
    .prepare<
      unknown[],
      TransferRule
    >("SELECT * FROM transfer_rules ORDER BY LOWER(value)")
    .all();
};

export const isTransferDescription = (
  description: string,
  rules: TransferRule[],
): boolean => {
  const normalizedDescription = normalizeForMatching(description);

  return rules.some((rule) =>
    normalizedDescription.includes(normalizeForMatching(rule.value)),
  );
};

export const createTransferRule = (
  value: string,
): TransferRuleMutationResult => {
  const validation = validateRuleValue(value);

  if (!validation.success) {
    return validation;
  }

  return getDB().transaction((): TransferRuleMutationResult => {
    const result = getDB()
      .prepare<[string]>("INSERT INTO transfer_rules (value) VALUES (?)")
      .run(validation.value);

    reclassifyTransactions();

    const rule = getDB()
      .prepare<
        [number],
        TransferRule
      >("SELECT * FROM transfer_rules WHERE id = ?")
      .get(Number(result.lastInsertRowid));

    if (!rule) {
      throw new Error("The created transfer rule could not be loaded.");
    }

    return { success: true, rule };
  })();
};

export const updateTransferRule = (
  id: number,
  value: string,
): TransferRuleMutationResult => {
  const validation = validateRuleValue(value, id);

  if (!validation.success) {
    return validation;
  }

  return getDB().transaction((): TransferRuleMutationResult => {
    const result = getDB()
      .prepare<[string, number]>(
        `UPDATE transfer_rules
         SET value = ?, updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
      )
      .run(validation.value, id);

    if (!result.changes) {
      return { success: false, error: "Transfer rule not found." };
    }

    reclassifyTransactions();

    const rule = getDB()
      .prepare<
        [number],
        TransferRule
      >("SELECT * FROM transfer_rules WHERE id = ?")
      .get(id);

    if (!rule) {
      throw new Error("The updated transfer rule could not be loaded.");
    }

    return { success: true, rule };
  })();
};

export const deleteTransferRule = (id: number): TransferRuleMutationResult => {
  return getDB().transaction((): TransferRuleMutationResult => {
    const result = getDB()
      .prepare<[number]>("DELETE FROM transfer_rules WHERE id = ?")
      .run(id);

    if (!result.changes) {
      return { success: false, error: "Transfer rule not found." };
    }

    reclassifyTransactions();
    return { success: true };
  })();
};
