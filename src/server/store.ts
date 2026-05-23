import { Project, ProgressInput, projectSchema, seedProject } from "../shared/domain";

export class ProjectStore {
  private project: Project;

  constructor(initialProject: Project = seedProject) {
    this.project = projectSchema.parse(initialProject);
  }

  read() {
    return this.project;
  }

  appendProgress(input: ProgressInput) {
    const event = {
      ...input,
      id: `P-${String(this.project.progress.length + 1).padStart(3, "0")}`,
      at: new Date().toISOString()
    };

    this.project = projectSchema.parse({
      ...this.project,
      progress: [event, ...this.project.progress]
    });

    return event;
  }

  markGate(gateId: string, status: Project["gates"][number]["status"]) {
    this.project = projectSchema.parse({
      ...this.project,
      gates: this.project.gates.map((gate) =>
        gate.id === gateId ? { ...gate, status, lastRunAt: new Date().toISOString() } : gate
      )
    });

    return this.project.gates.find((gate) => gate.id === gateId) ?? null;
  }
}
