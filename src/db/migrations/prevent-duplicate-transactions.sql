CREATE INDEX IF NOT EXISTS transactions_duplicate_lookup
ON transactions (
  account,
  date,
  amount_in_cents,
  amount_after_transaction_in_cents
);

CREATE TRIGGER IF NOT EXISTS prevent_duplicate_transactions
BEFORE INSERT ON transactions
WHEN EXISTS (
  SELECT 1
  FROM transactions
  WHERE date IS NEW.date
    AND description IS NEW.description
    AND account IS NEW.account
    AND to_account IS NEW.to_account
    AND code IS NEW.code
    AND transaction_type IS NEW.transaction_type
    AND amount_in_cents IS NEW.amount_in_cents
    AND mutation_type IS NEW.mutation_type
    AND remarks IS NEW.remarks
    AND amount_after_transaction_in_cents IS NEW.amount_after_transaction_in_cents
)
BEGIN
  SELECT RAISE(IGNORE);
END;
