import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "../src/server/index";

describe("delivery harness API", () => {
  it("serves a typed project and readiness summary", async () => {
    const response = await request(createApp()).get("/api/project").expect(200);

    expect(response.body.project.id).toBe("super-individual-e2e");
    expect(response.body.summary.total).toBeGreaterThan(0);
  });

  it("appends progress events through the public contract", async () => {
    const app = createApp();

    const response = await request(app)
      .post("/api/progress")
      .send({
        actor: "coding-agent",
        summary: "Implemented an API behavior under test.",
        decision: "Use shared zod schemas for request validation.",
        next: "Run the delivery verification command."
      })
      .expect(201);

    expect(response.body.event.id).toBe("P-002");

    const projectResponse = await request(app).get("/api/project").expect(200);
    expect(projectResponse.body.project.progress[0].summary).toContain("API behavior");
  });

  it("rejects malformed progress updates", async () => {
    await request(createApp()).post("/api/progress").send({ actor: "coding-agent" }).expect(400);
  });
});
