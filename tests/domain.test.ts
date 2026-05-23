import { describe, expect, it } from "vitest";
import { projectSchema, seedProject, summarizeProject } from "../src/shared/domain";

describe("shared project contract", () => {
  it("validates the seed project across stack boundaries", () => {
    expect(() => projectSchema.parse(seedProject)).not.toThrow();
  });

  it("computes delivery readiness from durable state", () => {
    const summary = summarizeProject(seedProject);

    expect(summary.total).toBe(4);
    expect(summary.featureReadiness).toBe(25);
    expect(summary.blocked).toBe(0);
    expect(summary.canShip).toBe(false);
  });
});
