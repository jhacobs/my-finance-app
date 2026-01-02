CREATE TABLE IF NOT EXISTS transactions (
  id INTEGER PRIMARY KEY,
  date DATETIME NOT NULL,
  description VARCHAR(255) NOT NULL,
  account VARCHAR(255) NOT NULL,
  to_account VARCHAR(255),
  code VARCHAR(255) NOT NULL,
  transaction_type VARCHAR(10) NOT NULL,
  amount_in_cents INTEGER NOT NULL,
  mutation_type VARCHAR(255) NOT NULL,
  remarks TEXT,
  amount_after_transaction_in_cents INTEGER NOT NULL,
  tag VARCHAR(255),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
