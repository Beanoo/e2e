# E2E Super Individual

A full-stack TypeScript project that turns an ambiguous product goal into a durable delivery harness.

The app targets `L2 · 进阶（跨栈一致性）` and includes `L3 · 挑战` capabilities: persistent feature lists, progress logs, quality gates, shared runtime schemas, repeatable initialization, and CI-ready verification.

## Stack

- React + Vite frontend
- Express API
- Shared Zod domain schema
- Vitest + Supertest verification

## Run

```bash
npm install
npm run dev
```

Open `http://localhost:5173`.

## Verify

```bash
npm run verify:delivery
```

This initializes harness runtime artifacts, runs tests, and builds the production frontend.
