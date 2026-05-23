import cors from "cors";
import express from "express";
import { progressInputSchema, summarizeProject } from "../shared/domain";
import { ProjectStore } from "./store";

export function createApp(store = new ProjectStore()) {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.get("/api/health", (_request, response) => {
    response.json({ ok: true, service: "e2e-super-individual" });
  });

  app.get("/api/project", (_request, response) => {
    const project = store.read();
    response.json({ project, summary: summarizeProject(project) });
  });

  app.post("/api/progress", (request, response) => {
    const parsed = progressInputSchema.safeParse(request.body);

    if (!parsed.success) {
      response.status(400).json({ error: "Invalid progress event", details: parsed.error.flatten() });
      return;
    }

    response.status(201).json({ event: store.appendProgress(parsed.data) });
  });

  app.patch("/api/gates/:gateId", (request, response) => {
    const status = request.body?.status;

    if (!["pending", "passing", "failing"].includes(status)) {
      response.status(400).json({ error: "Gate status must be pending, passing, or failing" });
      return;
    }

    const gate = store.markGate(request.params.gateId, status);
    if (!gate) {
      response.status(404).json({ error: "Gate not found" });
      return;
    }

    response.json({ gate });
  });

  return app;
}

if (process.env.NODE_ENV !== "test") {
  const port = Number(process.env.PORT ?? 8787);
  createApp().listen(port, () => {
    console.log(`E2E Super Individual API listening on http://localhost:${port}`);
  });
}
