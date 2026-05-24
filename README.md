# E2E Super Individual

A full-stack TypeScript project that turns an ambiguous product goal into a durable delivery harness and Git-managed delivery branch.

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

## Use

1. Enter a product requirement in the dashboard.
2. Submit it to create a transparent delivery session.
3. The API checks `git@github.com:Beanoo/Conduiteg.git`, creates an isolated `e2e/...` branch, writes the first delivery artifact into the target repo, and commits it.
4. Continue implementation on the generated branch, then run the target repository checks.

The current target repository path is `/Users/doumengyao/work/Conduiteg`.

## Verify

```bash
npm run verify:delivery
```

This initializes harness runtime artifacts, runs tests, and builds the production frontend.
