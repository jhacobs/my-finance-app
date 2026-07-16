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

- Node.js
- npm

## Getting started

```bash
npm install
npm start
```

## Commands

| Command | Description |
| --- | --- |
| `npm start` | Run the app locally. |
| `npm run lint` | Check the code with ESLint. |
| `npm run package` | Build a local packaged app. |
| `npm run make` | Create distributable artifacts. |

## Security

Read [Authentication and encryption](docs/security/authentication-and-encryption.md) for details about how the app protects local data.
