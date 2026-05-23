# E2E Super Individual Harness

This repository implements a full-stack delivery harness for an L2 advanced target with L3 challenge capability.

## Operating Model

- Initializer state lives in `src/shared/domain.ts` as typed project, feature, progress, and gate contracts.
- Coding-agent work flows through small API and UI surfaces that consume the same shared types.
- Long-running state is externalized in a feature list, progress log, quality gates, and `data/runtime.json`.
- Verification is repeatable through `npm run verify:delivery`.

## Capability Mapping

| Capability | Implementation |
| --- | --- |
| L2 · cross-stack consistency | Shared Zod schemas drive API responses, frontend rendering, and tests. |
| L3 · challenge capability | Durable progress logs, owner modes, quality gates, and initializer script make work resumable. |
| End-to-end delivery | API, UI, tests, build, CI workflow, and setup script are part of one project. |

## Local Commands

```bash
npm install
npm run dev
npm run verify:delivery
```

The web app runs on `http://localhost:5173` and proxies API calls to `http://localhost:8787`.
