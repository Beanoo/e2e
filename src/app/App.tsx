import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  ClipboardList,
  GitBranch,
  Layers3,
  PlayCircle,
  ShieldCheck
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Project, summarizeProject } from "../shared/domain";

type ProjectResponse = {
  project: Project;
  summary: ReturnType<typeof summarizeProject>;
};

const statusLabels: Record<string, string> = {
  planned: "Planned",
  active: "Active",
  blocked: "Blocked",
  verified: "Verified",
  shipped: "Shipped",
  pending: "Pending",
  passing: "Passing",
  failing: "Failing"
};

export function App() {
  const [data, setData] = useState<ProjectResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/project")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`API returned ${response.status}`);
        }
        return response.json() as Promise<ProjectResponse>;
      })
      .then(setData)
      .catch((cause: Error) => setError(cause.message));
  }, []);

  const summary = useMemo(() => {
    if (!data) return null;
    return data.summary;
  }, [data]);

  if (error) {
    return (
      <main className="shell">
        <section className="error-state">
          <AlertTriangle size={28} />
          <h1>API unavailable</h1>
          <p>{error}</p>
        </section>
      </main>
    );
  }

  if (!data || !summary) {
    return (
      <main className="shell loading">
        <Activity className="spin" size={32} />
      </main>
    );
  }

  const { project } = data;

  return (
    <main className="shell">
      <section className="topbar">
        <div>
          <p className="eyebrow">L2 cross-stack consistency · L3 challenge ready</p>
          <h1>{project.name}</h1>
          <p className="mission">{project.mission}</p>
        </div>
        <div className="level-lockup" aria-label="Target level">
          <span>{project.targetLevel}</span>
          <small>{project.challengeReady ? "Challenge ready" : "Standard mode"}</small>
        </div>
      </section>

      <section className="metrics" aria-label="Readiness metrics">
        <Metric icon={<Layers3 />} label="Feature readiness" value={`${summary.featureReadiness}%`} />
        <Metric icon={<ShieldCheck />} label="Gate readiness" value={`${summary.gateReadiness}%`} />
        <Metric icon={<ClipboardList />} label="Feature count" value={String(summary.total)} />
        <Metric
          icon={summary.canShip ? <CheckCircle2 /> : <AlertTriangle />}
          label="Ship state"
          value={summary.canShip ? "Ready" : "Not ready"}
        />
      </section>

      <section className="workbench">
        <div className="panel wide">
          <div className="panel-heading">
            <h2>Feature List</h2>
            <GitBranch size={20} />
          </div>
          <div className="feature-table">
            {project.features.map((feature) => (
              <article className="feature-row" key={feature.id}>
                <div>
                  <div className="row-title">
                    <span>{feature.id}</span>
                    <h3>{feature.title}</h3>
                  </div>
                  <p>{feature.acceptance[0]}</p>
                </div>
                <div className="row-meta">
                  <Badge>{feature.stack}</Badge>
                  <Badge>{feature.ownerMode}</Badge>
                  <Badge tone={feature.status}>{statusLabels[feature.status]}</Badge>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="panel">
          <div className="panel-heading">
            <h2>Quality Gates</h2>
            <PlayCircle size={20} />
          </div>
          <div className="gate-list">
            {project.gates.map((gate) => (
              <article className="gate" key={gate.id}>
                <div>
                  <h3>{gate.name}</h3>
                  <code>{gate.command}</code>
                </div>
                <Badge tone={gate.status}>{statusLabels[gate.status]}</Badge>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="lower-grid">
        <div className="panel">
          <div className="panel-heading">
            <h2>Harness Principles</h2>
            <ShieldCheck size={20} />
          </div>
          <ul className="principles">
            {project.designPrinciples.map((principle) => (
              <li key={principle}>{principle}</li>
            ))}
          </ul>
        </div>

        <div className="panel">
          <div className="panel-heading">
            <h2>Progress Log</h2>
            <Activity size={20} />
          </div>
          <div className="timeline">
            {project.progress.map((event) => (
              <article key={event.id}>
                <time>{new Date(event.at).toLocaleString()}</time>
                <h3>{event.summary}</h3>
                <p>{event.decision}</p>
                <small>{event.next}</small>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <article className="metric">
      <div className="metric-icon">{icon}</div>
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

function Badge({ children, tone }: { children: React.ReactNode; tone?: string }) {
  return (
    <span className={`badge ${tone ? `badge-${tone}` : ""}`}>
      {children}
    </span>
  );
}
