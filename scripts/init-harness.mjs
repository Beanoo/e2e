import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const root = resolve(new URL("..", import.meta.url).pathname);
const runtimePath = resolve(root, "data/runtime.json");

const runtime = {
  initializedAt: new Date().toISOString(),
  harness: {
    target: "L2 · advanced cross-stack consistency",
    challengeCapability: "L3 · long-running full-stack delivery",
    source: "https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents"
  },
  roles: {
    initializer: [
      "Convert ambiguous goals into durable feature lists.",
      "Create repeatable setup and verification scripts.",
      "Keep progress and acceptance criteria explicit."
    ],
    codingAgent: [
      "Implement scoped features against shared contracts.",
      "Append progress decisions before handing off long-running work.",
      "Run quality gates and attach evidence."
    ]
  },
  artifacts: [
    "src/shared/domain.ts",
    "src/server/index.ts",
    "src/app/App.tsx",
    "tests/domain.test.ts",
    "tests/api.test.ts",
    ".github/workflows/ci.yml"
  ]
};

await mkdir(dirname(runtimePath), { recursive: true });
await writeFile(runtimePath, `${JSON.stringify(runtime, null, 2)}\n`);
console.log(`Harness initialized at ${runtimePath}`);
