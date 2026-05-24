import request from "supertest";
import { execFile } from "node:child_process";
import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";
import { describe, expect, it } from "vitest";
import { createApp } from "../src/server/index";
import { GitDeliveryService } from "../src/server/gitDelivery";

const execFileAsync = promisify(execFile);

async function git(args: string[], cwd: string) {
  const { stdout } = await execFileAsync("git", args, { cwd });
  return stdout.trim();
}

async function createTargetRepo() {
  const repo = await mkdtemp(join(tmpdir(), "conduiteg-target-"));
  await git(["init", "-b", "main"], repo);
  await git(["remote", "add", "origin", "git@github.com:Beanoo/Conduiteg.git"], repo);
  await writeFile(join(repo, "README.md"), "# Test Conduiteg\n");
  await git(["add", "README.md"], repo);
  await git(
    [
      "-c",
      "user.name=Test",
      "-c",
      "user.email=test@example.local",
      "commit",
      "-m",
      "Initial commit"
    ],
    repo
  );
  return repo;
}

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

  it("creates a transparent delivery branch and commit in the target repository", async () => {
    const repo = await createTargetRepo();
    const app = createApp(undefined, new GitDeliveryService(repo));

    const response = await request(app)
      .post("/api/deliveries")
      .send({
        requirement:
          "Add author follow status to the article detail page and make the state visible after login."
      })
      .expect(201);

    expect(response.body.session.branch).toContain("e2e/d-");
    expect(response.body.session.filesChanged[0]).toContain("docs/e2e-deliveries/");
    expect(response.body.session.commit).toMatch(/[a-f0-9]+/);
    expect(await git(["status", "--short"], repo)).toBe("");
  });
});
