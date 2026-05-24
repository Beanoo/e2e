import { z } from "zod";

export const capabilityLevelSchema = z.enum(["L1", "L2", "L3"]);
export type CapabilityLevel = z.infer<typeof capabilityLevelSchema>;

export const deliveryStatusSchema = z.enum([
  "planned",
  "active",
  "blocked",
  "verified",
  "shipped"
]);
export type DeliveryStatus = z.infer<typeof deliveryStatusSchema>;

export const featureSchema = z.object({
  id: z.string(),
  title: z.string(),
  stack: z.enum(["product", "frontend", "backend", "data", "devops", "qa"]),
  status: deliveryStatusSchema,
  ownerMode: z.enum(["initializer", "coding-agent", "reviewer", "operator"]),
  acceptance: z.array(z.string()).min(1),
  evidence: z.array(z.string()).default([])
});
export type Feature = z.infer<typeof featureSchema>;

export const progressEventSchema = z.object({
  id: z.string(),
  at: z.string(),
  actor: z.string(),
  summary: z.string(),
  decision: z.string(),
  next: z.string()
});
export type ProgressEvent = z.infer<typeof progressEventSchema>;

export const qualityGateSchema = z.object({
  id: z.string(),
  name: z.string(),
  command: z.string(),
  required: z.boolean(),
  status: z.enum(["pending", "passing", "failing"]),
  lastRunAt: z.string().nullable()
});
export type QualityGate = z.infer<typeof qualityGateSchema>;

export const projectSchema = z.object({
  id: z.string(),
  name: z.string(),
  targetLevel: capabilityLevelSchema,
  challengeReady: z.boolean(),
  mission: z.string(),
  designPrinciples: z.array(z.string()),
  features: z.array(featureSchema),
  progress: z.array(progressEventSchema),
  gates: z.array(qualityGateSchema)
});
export type Project = z.infer<typeof projectSchema>;

export const seedProject: Project = {
  id: "super-individual-e2e",
  name: "E2E Super Individual",
  targetLevel: "L2",
  challengeReady: true,
  mission:
    "Turn an ambiguous full-stack goal into a shippable project by keeping product intent, implementation state, verification, and delivery evidence synchronized across the stack.",
  designPrinciples: [
    "Externalize long-running state in durable feature lists and progress logs.",
    "Separate initializer responsibilities from coding-agent execution.",
    "Make every feature testable through explicit acceptance criteria and evidence.",
    "Keep cross-stack contracts typed once and reused by API, UI, and tests.",
    "Prefer repeatable scripts over tribal setup knowledge."
  ],
  features: [
    {
      id: "F-001",
      title: "Cross-stack typed project contract",
      stack: "backend",
      status: "verified",
      ownerMode: "initializer",
      acceptance: [
        "Project, feature, progress, and quality-gate shapes are validated at runtime.",
        "The same schema types are consumed by server, client, and tests."
      ],
      evidence: ["src/shared/domain.ts", "tests/domain.test.ts"]
    },
    {
      id: "F-002",
      title: "Delivery harness API",
      stack: "backend",
      status: "active",
      ownerMode: "coding-agent",
      acceptance: [
        "Clients can read the active delivery plan.",
        "Progress events can be appended without breaking the shared contract."
      ],
      evidence: ["src/server/index.ts", "tests/api.test.ts"]
    },
    {
      id: "F-003",
      title: "Operator dashboard",
      stack: "frontend",
      status: "active",
      ownerMode: "coding-agent",
      acceptance: [
        "Dashboard shows readiness, feature coverage, gates, and progress log.",
        "The UI makes blocked work and missing evidence visible."
      ],
      evidence: ["src/app/App.tsx"]
    },
    {
      id: "F-004",
      title: "Repeatable delivery verification",
      stack: "devops",
      status: "planned",
      ownerMode: "operator",
      acceptance: [
        "A single command initializes harness artifacts, runs tests, and builds the app.",
        "CI can run the same command."
      ],
      evidence: ["scripts/init-harness.mjs", ".github/workflows/ci.yml"]
    }
  ],
  progress: [
    {
      id: "P-001",
      at: "2026-05-24T00:00:00.000Z",
      actor: "initializer",
      summary: "Created the durable delivery target for an L2 project with L3 challenge capability.",
      decision: "Use a typed harness as the source of truth for product, API, UI, and verification.",
      next: "Implement server endpoints, frontend dashboard, and repeatable verification."
    }
  ],
  gates: [
    {
      id: "G-001",
      name: "Shared schema tests",
      command: "npm run test",
      required: true,
      status: "pending",
      lastRunAt: null
    },
    {
      id: "G-002",
      name: "Production build",
      command: "npm run build",
      required: true,
      status: "pending",
      lastRunAt: null
    },
    {
      id: "G-003",
      name: "Harness initialization",
      command: "npm run init:harness",
      required: true,
      status: "pending",
      lastRunAt: null
    }
  ]
};

export function summarizeProject(project: Project) {
  const total = project.features.length;
  const verified = project.features.filter((feature) =>
    ["verified", "shipped"].includes(feature.status)
  ).length;
  const blocked = project.features.filter((feature) => feature.status === "blocked").length;
  const evidenceMissing = project.features.filter((feature) => feature.evidence.length === 0).length;
  const requiredGates = project.gates.filter((gate) => gate.required);
  const passingRequiredGates = requiredGates.filter((gate) => gate.status === "passing").length;

  return {
    total,
    verified,
    blocked,
    evidenceMissing,
    featureReadiness: total === 0 ? 0 : Math.round((verified / total) * 100),
    gateReadiness:
      requiredGates.length === 0
        ? 100
        : Math.round((passingRequiredGates / requiredGates.length) * 100),
    canShip:
      blocked === 0 &&
      evidenceMissing === 0 &&
      total > 0 &&
      verified === total &&
      passingRequiredGates === requiredGates.length
  };
}

export const progressInputSchema = progressEventSchema.omit({ id: true, at: true });
export type ProgressInput = z.infer<typeof progressInputSchema>;

export const repositoryStatusSchema = z.object({
  path: z.string(),
  remote: z.string(),
  branch: z.string(),
  clean: z.boolean(),
  changes: z.array(z.string())
});
export type RepositoryStatus = z.infer<typeof repositoryStatusSchema>;

export const productRequirementSchema = z.object({
  requirement: z.string().min(12, "Describe the product requirement in at least 12 characters")
});
export type ProductRequirement = z.infer<typeof productRequirementSchema>;

export const deliveryStepSchema = z.object({
  id: z.string(),
  title: z.string(),
  detail: z.string(),
  status: z.enum(["done", "blocked", "pending"])
});
export type DeliveryStep = z.infer<typeof deliveryStepSchema>;

export const deliverySessionSchema = z.object({
  id: z.string(),
  requirement: z.string(),
  repository: repositoryStatusSchema,
  branch: z.string(),
  filesChanged: z.array(z.string()),
  commit: z.string().nullable(),
  steps: z.array(deliveryStepSchema),
  createdAt: z.string()
});
export type DeliverySession = z.infer<typeof deliverySessionSchema>;
