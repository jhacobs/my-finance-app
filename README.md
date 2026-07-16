# My Finance App

My Finance App is a local desktop app for tracking your finances. Your data stays on your computer and is protected by a password and encrypted local database.

It uses Electron Forge to run the app locally, package it, and create distributable artifacts.

## Features

- Import transactions from CSV files.
- Browse transactions and filter them by date.
- View your balance, income, and expenses.
- Define transfer rules so internal transfers do not affect your spending totals.
- Explore monthly cash flow and money-saved charts.

## Requirements

- Node.js 24
- npm

## Getting started

```bash
npm install
npm start
```

## Commands

| Command           | Description                     |
| ----------------- | ------------------------------- |
| `npm start`       | Run the app locally.            |
| `npm run lint`    | Check the code with ESLint.     |
| `npm run package` | Build a local packaged app.     |
| `npm run make`    | Create distributable artifacts. |

## Continuous integration

Pull requests and pushes to `main` run ESLint and package the app on Windows
x64, macOS x64, macOS arm64, and Linux x64. Packaging on each native operating
system verifies the native `argon2` and encrypted SQLite dependencies.

## Creating a release

Releases are built from tags that exactly match the version in `package.json`.

1. Update the version without creating a tag:

   ```bash
   npm version 1.1.0 --no-git-tag-version
   ```

2. Commit `package.json` and `package-lock.json`, then merge that change into
   `main`.
3. Update local `main`, create an annotated tag, and push it:

   ```bash
   git switch main
   git pull --ff-only
   git tag -a v1.1.0 -m "Release v1.1.0"
   git push origin v1.1.0
   ```

GitHub Actions builds Windows Squirrel, macOS DMG and ZIP, and Linux DEB and
RPM files. When every build succeeds, it creates a draft GitHub Release. Check
the files and generated notes before publishing the draft.

Current builds are unsigned. Windows may show a SmartScreen warning, and macOS
may block the app with Gatekeeper until the user explicitly allows it.

## Security

Read [Authentication and encryption](docs/security/authentication-and-encryption.md) for details about how the app protects local data.
