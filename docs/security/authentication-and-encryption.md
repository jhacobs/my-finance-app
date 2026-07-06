# Authentication and Encryption

This document describes how the app authenticates the local user and protects the SQLite database.

## Goals

- Require the user's password before opening financial data.
- Store no plaintext password, master key, or database encryption key on disk.
- Use a random per-install salt for password-based key derivation.
- Encrypt the database with a random database encryption key.
- Protect the database encryption key with authenticated encryption before storing it in config.

## Stored Config

The app stores authentication metadata in Electron's `userData` directory as `config.json`.

Fields:

- `passwordHash`: Argon2 hash used to verify the password-derived master key.
- `protectedEncryptionKey`: database encryption key encrypted with AES-256-GCM.
- `masterKeySalt`: random hex salt used to derive the master key from the user's password.
- `onboardingCompleted`: whether initial password setup finished.

`masterKeySalt` is not secret. It must be random so the same password does not produce the same master key across installs.

## Key Flow

On onboarding:

1. Generate `masterKeySalt` with `crypto.randomBytes`.
2. Derive `masterKey` from the user's password and `masterKeySalt` using Argon2 raw output.
3. Hash `masterKey.toString("hex")` with Argon2 and store it as `passwordHash`.
4. Generate a random database encryption key.
5. Encrypt the database encryption key with AES-256-GCM using `masterKey`.
6. Store the GCM result as `protectedEncryptionKey`.
7. Clear in-memory key buffers after use where the code owns the buffer.

On login:

1. Read `masterKeySalt` and derive `masterKey` from the entered password.
2. Verify `masterKey.toString("hex")` against `passwordHash`.
3. If verification succeeds, decrypt `protectedEncryptionKey` with AES-256-GCM.
4. Keep the decrypted database encryption key in process memory while the user is authenticated.
5. Open SQLite with the decrypted database encryption key.

## Protected Encryption Key Format

`protectedEncryptionKey` uses this colon-separated format:

```text
gcm:<initialization-vector-hex>:<ciphertext-hex>:<auth-tag-hex>
```

The auth tag is required. It lets login fail if the stored encrypted key is corrupted or tampered with.

## Database Encryption

The SQLite database is opened with `better-sqlite3-multiple-ciphers`.

Before applying the key, the app pins the SQLite cipher:

```ts
database.pragma("cipher='chacha20'");
database.key(encryptionKey);
```

## Logout and Process Lifetime

On logout:

1. Close the SQLite connection if one is open.
2. Clear the cached database connection handle.
3. Zero and remove the in-memory database encryption key.

Clearing the cached database handle matters because a closed `better-sqlite3` connection cannot be reused on the next login.
