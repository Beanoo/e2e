import {
  Activity,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  Code2,
  GitBranch,
  Layers3,
  PlayCircle,
  Send,
  ShieldCheck
} from "lucide-react";
import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import { DeliverySession, Project, RepositoryStatus, summarizeProject } from "../shared/domain";

type ProjectResponse = {
  project: Project;
  summary: ReturnType<typeof summarizeProject>;
};

type RepositoryResponse = {
  repository: RepositoryStatus;
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
  const [repository, setRepository] = useState<RepositoryStatus | null>(null);
  const [requirement, setRequirement] = useState("");
  const [session, setSession] = useState<DeliverySession | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deliveryError, setDeliveryError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/project").then((response) => {
        if (!response.ok) {
          throw new Error(`Project API returned ${response.status}`);
        }
        return response.json() as Promise<ProjectResponse>;
      }),
      fetch("/api/repository").then((response) => {
        if (!response.ok) {
          throw new Error(`Repository API returned ${response.status}`);
        }
        return response.json() as Promise<RepositoryResponse>;
      })
    ])
      .then(([projectResponse, repositoryResponse]) => {
        setData(projectResponse);
        setRepository(repositoryResponse.repository);
      })
      .catch((cause: Error) => setError(cause.message));
  }, []);

  async function createDelivery(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setDeliveryError(null);

    try {
      const response = await fetch("/api/deliveries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requirement })
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error ?? `Delivery API returned ${response.status}`);
      }

      setSession(payload.session);
      setRepository(payload.session.repository);
    } catch (cause) {
      setDeliveryError(cause instanceof Error ? cause.message : "Unable to create delivery");
    } finally {
      setSubmitting(false);
    }
  }

  function refreshRepository() {
    fetch("/api/repository")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Repository API returned ${response.status}`);
        }
        return response.json() as Promise<RepositoryResponse>;
      })
      .then((payload) => setRepository(payload.repository))
      .catch((cause: Error) => setDeliveryError(cause.message));
  }

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

  if (!data || !summary || !repository) {
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
          <p className="mission">
            输入产品需求，输出目标仓库里的可追踪代码变更。中间步骤通过 Git 状态、交付分支、
            变更文件、提交哈希和质量门禁对用户透明。
          </p>
        </div>
        <div className="level-lockup" aria-label="Target level">
          <span>{project.targetLevel}</span>
          <small>{project.challengeReady ? "Challenge ready" : "Standard mode"}</small>
        </div>
      </section>

      <section className="metrics" aria-label="Readiness metrics">
        <Metric icon={<Layers3 />} label="Feature readiness" value={`${summary.featureReadiness}%`} />
        <Metric icon={<ShieldCheck />} label="Gate readiness" value={`${summary.gateReadiness}%`} />
        <Metric icon={<GitBranch />} label="Target branch" value={repository.branch || "detached"} />
        <Metric
          icon={repository.clean ? <CheckCircle2 /> : <AlertTriangle />}
          label="Repository"
          value={repository.clean ? "Clean" : "Dirty"}
        />
      </section>

      <section className="delivery-grid">
        <form className="panel intake" onSubmit={createDelivery}>
          <div className="panel-heading">
            <h2>Product Requirement In</h2>
            <Send size={20} />
          </div>
          <textarea
            value={requirement}
            minLength={12}
            onChange={(event) => setRequirement(event.target.value)}
            placeholder="例如：给文章详情页增加收藏作者功能，登录用户可以关注作者并在个人主页看到关注状态。"
          />
          {deliveryError ? <p className="inline-error">{deliveryError}</p> : null}
          <button disabled={submitting || requirement.trim().length < 12} type="submit">
            <Code2 size={18} />
            {submitting ? "Creating delivery..." : "Generate deliverable code branch"}
          </button>
        </form>

        <div className="panel repository-panel">
          <div className="panel-heading">
            <h2>Conduiteg Git Target</h2>
            <button className="icon-button" onClick={refreshRepository} type="button">
              <Activity size={18} />
            </button>
          </div>
          <dl className="repo-facts">
            <div>
              <dt>Path</dt>
              <dd>{repository.path}</dd>
            </div>
            <div>
              <dt>Remote</dt>
              <dd>{repository.remote}</dd>
            </div>
            <div>
              <dt>Branch</dt>
              <dd>{repository.branch || "detached"}</dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd>{repository.clean ? "Clean working tree" : repository.changes.join(", ")}</dd>
            </div>
          </dl>
        </div>
      </section>

      {session ? (
        <section className="panel session-panel">
          <div className="panel-heading">
            <h2>Deliverable Code Out</h2>
            <ArrowRight size={20} />
          </div>
          <div className="session-summary">
            <div>
              <span>Session</span>
              <strong>{session.id}</strong>
            </div>
            <div>
              <span>Branch</span>
              <strong>{session.branch}</strong>
            </div>
            <div>
              <span>Commit</span>
              <strong>{session.commit}</strong>
            </div>
            <div>
              <span>Files changed</span>
              <strong>{session.filesChanged.join(", ")}</strong>
            </div>
          </div>
          <div className="step-list">
            {session.steps.map((step) => (
              <article key={step.id} className="step">
                <CheckCircle2 size={18} />
                <div>
                  <h3>{step.title}</h3>
                  <p>{step.detail}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <section className="workbench">
        <div className="panel wide">
          <div className="panel-heading">
            <h2>Feature List</h2>
            <ClipboardList size={20} />
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
