import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Users, Eye, Radio, Globe, BarChart3, FolderKanban } from "lucide-react";
import { api } from "../api";
import { AppShell } from "../components/AppShell";
import { useWorkspace } from "../workspace";
import type { Stats, Site } from "../types";

export default function Home() {
  const { active, loading } = useWorkspace();
  const [stats, setStats] = useState<Stats | null>(null);
  const [sites, setSites] = useState<Site[]>([]);

  useEffect(() => {
    if (!active) { setStats(null); setSites([]); return; }
    api.get<Stats>(`/api/workspaces/${active._id}/stats?range=24h`).then(setStats).catch(() => setStats(null));
    api.get<Site[]>(`/api/workspaces/${active._id}/sites`).then(setSites).catch(() => setSites([]));
  }, [active]);

  if (loading) return <AppShell><p className="muted">Loading…</p></AppShell>;

  if (!active) {
    return (
      <AppShell>
        <div className="empty" style={{ marginTop: "2rem" }}>
          <FolderKanban size={40} />
          <p>No workspace yet. Create one to get started.</p>
          <Link to="/app/workspaces" className="btn-primary">Go to Workspaces</Link>
        </div>
      </AppShell>
    );
  }

  const kpis = [
    { icon: Users, label: "Visitors (24h)", val: stats?.visitors ?? 0, live: false },
    { icon: Eye, label: "Pageviews (24h)", val: stats?.pageviews ?? 0, live: false },
    { icon: Radio, label: "Live now", val: stats?.live ?? 0, live: true },
    { icon: Globe, label: "Sites", val: sites.length, live: false },
  ];

  return (
    <AppShell>
      <div className="page-head">
        <div>
          <h1>Welcome back 👋</h1>
          <p className="muted">Overview for <strong>{active.name}</strong> — last 24 hours.</p>
        </div>
        <Link to="/app/analytics" className="btn-primary"><BarChart3 size={16} /> Full analytics</Link>
      </div>

      <div className="kpi-row" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
        {kpis.map((k) => (
          <div key={k.label} className={`kpi ${k.live ? "live" : ""}`}>
            <div className="kpi-icon"><k.icon size={17} /></div>
            <span className="kpi-val">{k.val.toLocaleString()}</span>
            <span className="kpi-label">{k.live && <span className="dot-live" />}{k.label}</span>
          </div>
        ))}
      </div>

      <div className="panel">
        <h3 className="panel-title">Your sites</h3>
        {sites.length === 0 ? (
          <p className="muted sm">No sites in this workspace. <Link to="/app/workspaces" className="link-cell">Add one</Link>.</p>
        ) : (
          <div className="card-grid">
            {sites.map((s) => (
              <Link key={s._id} to={`/app/workspaces`} className="tile">
                <div className="tile-body">
                  <h3>{s.name}</h3>
                  <span className="muted">{s.domain}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
