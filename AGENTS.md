# My finance app

## Project Structure & Module Organization

This is an Electron Forge app using Vite, React, TypeScript, and SQLite. Application code lives in `src/`. Electron main-process code starts at `src/main.ts`, with app-side features under `src/app/` and database setup under `src/db/`. Renderer code lives in `src/renderer/`: routes in `routes/`, reusable components in `components/`, forms in `forms/`, hooks in `hooks/`, and global styles in `styles/globals.css`. Shared TypeScript models are in `src/models/`. Generated TanStack Router output is `src/renderer/routeTree.gen.ts`; do not edit it by hand.

## Build, Test, and Development Commands

- `npm install`: install dependencies from `package-lock.json`.
- `npm start`: run the Electron app locally through Electron Forge.
- `npm run package`: build a local packaged app.
- `npm run make`: create distributable artifacts using Forge makers.
- `npm run lint`: run ESLint across TypeScript, React, imports, hooks, and TanStack Query usage.
- `npm run prettier`: format files with Prettier.

There is no `npm test` script yet. Add one before introducing required automated tests.

## Coding Style & Naming Conventions

Use TypeScript with strict compiler settings. `.editorconfig` requires UTF-8, LF line endings, final newlines, trimmed trailing whitespace, and 2-space indentation. Prefer the `@/*` path alias for imports from `src/`. Keep React components in PascalCase, hooks named `useSomething`, and feature helpers grouped by domain, such as `src/app/auth/login.ts`.

ESLint ignores `dist` and `src/renderer/components/ui`, so treat UI primitives there as generated or vendor-style code unless intentionally updating them.

## Testing Guidelines

No test framework is configured yet. When adding tests, colocate focused tests near the code they cover or introduce a consistent `src/**/__tests__/` pattern. Name tests after the behavior, for example `login.test.ts` or `transactions-table.test.tsx`. Until a test script exists, verify changes with `npm run lint` and manual app checks through `npm start`.

## Commit & Pull Request Guidelines

Use short imperative subjects, for example `Add auth and encryption logic` and `Get recent transactions`. Follow that style: start with a verb, keep the subject specific, and avoid generated-attribution trailers.

Pull requests should describe the user-visible change, list verification performed. Link related issues when available and call out database migrations, config changes, or new environment variables.

## Security & Configuration Tips

Keep secrets out of git; local environment values belong in `.env`. Be careful when editing authentication, encryption, or `better-sqlite3-multiple-ciphers` code, and document any migration required for existing user data.
