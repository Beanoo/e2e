import { execFile } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { basename, join } from "node:path";
import { promisify } from "node:util";
import {
  DeliverySession,
  ProductRequirement,
  RepositoryStatus,
  productRequirementSchema,
  repositoryStatusSchema
} from "../shared/domain";

const execFileAsync = promisify(execFile);
const DEFAULT_REPOSITORY_PATH = "/Users/doumengyao/work/Conduiteg";
const EXPECTED_REMOTE = "git@github.com:Beanoo/Conduiteg.git";

async function git(args: string[], cwd: string) {
  const { stdout, stderr } = await execFileAsync("git", args, {
    cwd,
    maxBuffer: 1024 * 1024
  });
  return `${stdout}${stderr}`.trim();
}

function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 36);
}

function firstLines(input: string, count = 6) {
  return input
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, count);
}

export class GitDeliveryService {
  constructor(private readonly repositoryPath = DEFAULT_REPOSITORY_PATH) {}

  async status(): Promise<RepositoryStatus> {
    const remote = await git(["remote", "get-url", "origin"], this.repositoryPath);
    const branch = await git(["branch", "--show-current"], this.repositoryPath);
    const changes = (await git(["status", "--short"], this.repositoryPath))
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);

    return repositoryStatusSchema.parse({
      path: this.repositoryPath,
      remote,
      branch,
      clean: changes.length === 0,
      changes
    });
  }

  async createDelivery(input: ProductRequirement): Promise<DeliverySession> {
    const parsed = productRequirementSchema.parse(input);
    const before = await this.status();

    if (before.remote !== EXPECTED_REMOTE) {
      throw new Error(`Target repository remote mismatch: ${before.remote}`);
    }

    if (!before.clean) {
      throw new Error("Target repository has uncommitted changes. Commit or stash them before delivery.");
    }

    const id = `D-${new Date().toISOString().replace(/[-:.TZ]/g, "").slice(0, 14)}`;
    const branch = `e2e/${id.toLowerCase()}-${slugify(parsed.requirement) || "delivery"}`;
    const filePath = join("docs", "e2e-deliveries", `${id}.md`);
    const absoluteFilePath = join(this.repositoryPath, filePath);
    const requirementLines = firstLines(parsed.requirement);

    await git(["checkout", "-B", branch], this.repositoryPath);
    await mkdir(join(this.repositoryPath, "docs", "e2e-deliveries"), { recursive: true });
    await writeFile(
      absoluteFilePath,
      [
        `# ${id} Product Delivery`,
        "",
        "## Product Requirement",
        "",
        parsed.requirement,
        "",
        "## Transparent Execution Plan",
        "",
        "1. Confirm repository state and create an isolated delivery branch.",
        "2. Convert the product requirement into acceptance criteria.",
        "3. Modify code in small reviewable changes.",
        "4. Run the repository verification command.",
        "5. Commit the resulting deliverable code and evidence.",
        "",
        "## Initial Acceptance Criteria",
        "",
        ...(requirementLines.length
          ? requirementLines.map((line) => `- ${line}`)
          : ["- Requirement is captured and ready for implementation."]),
        "",
        "## Repository Context",
        "",
        `- Repository: ${basename(this.repositoryPath)}`,
        `- Remote: ${before.remote}`,
        `- Base branch: ${before.branch}`,
        `- Delivery branch: ${branch}`,
        "",
        "## Next Code Work",
        "",
        "- Identify frontend, backend, data, and test files affected by this requirement.",
        "- Implement the smallest vertical slice that can be verified end to end.",
        "- Replace this planning artifact with concrete code evidence as files are changed.",
        ""
      ].join("\n")
    );

    await git(["add", filePath], this.repositoryPath);
    await git(
      [
        "-c",
        "user.name=E2E Delivery Agent",
        "-c",
        "user.email=e2e-delivery-agent@example.local",
        "commit",
        "-m",
        `Start ${id} delivery`
      ],
      this.repositoryPath
    );

    const commit = await git(["rev-parse", "--short", "HEAD"], this.repositoryPath);
    const repository = await this.status();

    return {
      id,
      requirement: parsed.requirement,
      repository,
      branch,
      filesChanged: [filePath],
      commit,
      createdAt: new Date().toISOString(),
      steps: [
        {
          id: "S-001",
          title: "Repository checked",
          detail: `Confirmed ${EXPECTED_REMOTE} is clean on ${before.branch}.`,
          status: "done"
        },
        {
          id: "S-002",
          title: "Delivery branch created",
          detail: `Created ${branch} for isolated code work.`,
          status: "done"
        },
        {
          id: "S-003",
          title: "Requirement converted",
          detail: `Wrote ${filePath} as the first traceable codebase artifact.`,
          status: "done"
        },
        {
          id: "S-004",
          title: "Git commit produced",
          detail: `Committed delivery artifact as ${commit}.`,
          status: "done"
        }
      ]
    };
  }
}
