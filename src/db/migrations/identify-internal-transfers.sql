CREATE TABLE transfer_rules (
  id INTEGER PRIMARY KEY,
  value TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX transfer_rules_value_unique
ON transfer_rules (LOWER(value));

ALTER TABLE transactions
ADD COLUMN is_transfer INTEGER NOT NULL DEFAULT 0;

CREATE INDEX transactions_is_transfer
ON transactions (is_transfer);
