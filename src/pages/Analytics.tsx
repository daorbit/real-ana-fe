import { useEffect, useState, useCallback } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import { Users, Eye, Radio, Plus, Copy, Check, Trash2, FolderKanban } from "lucide-react";
import { api, API_ORIGIN } from "../api";
import { AppShell } from "../components/AppShell";
import { FrameworkIcon } from "../components/Brand";
import { useWorkspace } from "../workspace";
import type { Stats, Site, Bucket } from "../types";

const RANGES = ["1h", "24h", "7d", "30d"];
const CHART = "#4f46e5"; // validated accent
const FRAMEWORKS = ["react", "vue", "angular", "svelte", "other"];

function BarList({ title, items }: { title: string; items: Bucket[] }) {
  const max = Math.max(1, ...items.map((i) => i.count));
  return (
    <div className="panel">
      <h3 className="panel-title">{title}</h3>
      {items.length === 0 && <p className="muted sm">No data yet</p>}
      <div className="barlist">
        {items.map((i) => (
          <div key={i.key} className="bar-row" title={`${i.key}: ${i.count}`}>
            <div className="bar-fill" style={{ width: `${(i.count / max) * 100}%` }} />
            <span className="bar-label">{i.key}</span>
            <span className="bar-count">{i.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ChartTip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tip">
      <span className="tip-label">{label}</span>
      <span className="tip-val">{payload[0].value} views</span>
    </div>
  );
}

export default function Analytics() {
  const { active, loading } = useWorkspace();
  const [range, setRange] = useState("24h");
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState<string | null>(null);

  // sites management
  const [sites, setSites] = useState<Site[]>([]);
  const [addOpen, setAddOpen] = useState(false);
  const [name, setName] = useState("");
  const [domain, setDomain] = useState("");
  const [framework, setFramework] = useState("react");
  const [created, setCreated] = useState<Site | null>(null);
  const [copied, setCopied] = useState(false);

  const loadStats = useCallback(() => {
    if (!active) return;
    api.get<Stats>(`/api/workspaces/${active._id}/stats?range=${range}`)
      .then((s) => { setStats(s); setError(null); })
      .catch((e) => setError(e.message));
  }, [active, range]);

  const loadSites = useCallback(() => {
    if (!active) return;
    api.get<Site[]>(`/api/workspaces/${active._id}/sites`).then(setSites).catch(() => {});
  }, [active]);

  useEffect(() => {
    loadStats();
    loadSites();
    const id = setInterval(loadStats, 3000);
    return () => clearInterval(id);
  }, [loadStats, loadSites]);

  const addSite = async (e: FormEvent) => {
    e.preventDefault();
    if (!active) return;
    try {
      const site = await api.post<Site>(`/api/workspaces/${active._id}/sites`, { name, domain, framework });
      setName(""); setDomain(""); setAddOpen(false);
      setCreated(site);
      loadSites();
    } catch (err) {
      setError(err instanceof Error ? err.message : "failed");
    }
  };

  const delSite = async (s: Site) => {
    if (!active) return;
    if (!confirm(`Delete site "${s.name}" and its analytics?`)) return;
    await api.del(`/api/workspaces/${active._id}/sites/${s.siteId}`);
    loadSites();
    loadStats();
  };

  const snippet = (siteId: string) =>
    `<script async src="${API_ORIGIN}/tracker.js" data-site="${siteId}"></script>`;
  const copy = (s: string) => { navigator.clipboard.writeText(s); setCopied(true); setTimeout(() => setCopied(false), 1500); };

  if (loading) return <AppShell><p className="muted">Loading…</p></AppShell>;
  if (!active) {
    return (
      <AppShell>
        <div className="empty" style={{ marginTop: "2rem" }}>
          <FolderKanban size={40} />
          <p>No workspace selected.</p>
          <Link to="/app/workspaces" className="btn-primary">Go to Workspaces</Link>
        </div>
      </AppShell>
    );
  }

  const kpis = [
    { icon: Users, label: "Visitors", val: stats?.visitors ?? 0, live: false },
    { icon: Eye, label: "Pageviews", val: stats?.pageviews ?? 0, live: false },
    { icon: Radio, label: "Live now", val: stats?.live ?? 0, live: true },
  ];

  return (
    <AppShell>
      <div className="page-head">
        <div>
          <h1>Analytics</h1>
          <p className="muted">
            Aggregated across {stats?.siteCount ?? sites.length} site{(stats?.siteCount ?? sites.length) === 1 ? "" : "s"} in <strong>{active.name}</strong>.
          </p>
        </div>
        <div className="range-tabs">
          {RANGES.map((r) => (
            <button key={r} className={r === range ? "active" : ""} onClick={() => setRange(r)}>{r}</button>
          ))}
        </div>
      </div>

      {error && <p className="error-box" style={{ marginBottom: "1rem" }}>{error}</p>}

      <div className="kpi-row">
        {kpis.map((k) => (
          <div key={k.label} className={`kpi ${k.live ? "live" : ""}`}>
            <div className="kpi-icon"><k.icon size={17} /></div>
            <span className="kpi-val">{k.val.toLocaleString()}</span>
            <span className="kpi-label">{k.live && <span className="dot-live" />}{k.label}</span>
          </div>
        ))}
      </div>

      <div className="panel chart-panel">
        <h3 className="panel-title">Pageviews over time</h3>
        <ResponsiveContainer width="100%" height={230}>
          <AreaChart data={stats?.timeseries ?? []} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
            <defs>
              <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={CHART} stopOpacity={0.35} />
                <stop offset="95%" stopColor={CHART} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#eaecf0" vertical={false} />
            <XAxis dataKey="bucket" tick={{ fontSize: 11, fill: "#98a2b3" }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#98a2b3" }} allowDecimals={false} tickLine={false} axisLine={false} />
            <Tooltip content={<ChartTip />} cursor={{ stroke: CHART, strokeWidth: 1 }} />
            <Area type="monotone" dataKey="views" stroke={CHART} strokeWidth={2.5} fill="url(#g)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="panel-grid">
        <BarList title="Top Pages" items={stats?.topPages ?? []} />
        <BarList title="Top Referrers" items={stats?.topReferrers ?? []} />
        <BarList title="Devices" items={stats?.devices ?? []} />
        <BarList title="Countries" items={stats?.countries ?? []} />
        <BarList title="UTM Sources" items={stats?.utmSources ?? []} />
      </div>

      {/* Sites management */}
      <div className="page-head" style={{ marginTop: "2.5rem" }}>
        <div><h1 style={{ fontSize: "1.2rem" }}>Sites in this workspace</h1></div>
        <button className="btn-primary" onClick={() => setAddOpen((v) => !v)}><Plus size={16} /> Add site</button>
      </div>

      {addOpen && (
        <form className="quick-form wrap" onSubmit={addSite}>
          <input autoFocus placeholder="Site name" value={name} onChange={(e) => setName(e.target.value)} required />
          <input placeholder="domain.com" value={domain} onChange={(e) => setDomain(e.target.value)} required />
          <select value={framework} onChange={(e) => setFramework(e.target.value)}>
            {FRAMEWORKS.map((f) => <option key={f} value={f}>{f}</option>)}
          </select>
          <button type="submit" className="btn-primary">Create</button>
        </form>
      )}

      {created && (
        <div className="snippet-card">
          <div className="snippet-head">
            <span className="ok-badge"><Check size={14} /> {created.name} created</span>
            <span className="muted">Paste before <code>&lt;/head&gt;</code> in your app</span>
          </div>
          <div className="snippet-code">
            <code>{snippet(created.siteId)}</code>
            <button className="copy-btn" onClick={() => copy(snippet(created.siteId))}>
              {copied ? <><Check size={14} /> Copied</> : <><Copy size={14} /> Copy</>}
            </button>
          </div>
        </div>
      )}

      {sites.length === 0 ? (
        <div className="empty"><p>No sites yet. Add one to start collecting analytics.</p></div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead><tr><th>Name</th><th>Domain</th><th>Framework</th><th>Snippet</th><th style={{ textAlign: "right" }}>Actions</th></tr></thead>
            <tbody>
              {sites.map((s) => (
                <tr key={s._id}>
                  <td className="row-name">{s.name}</td>
                  <td className="muted">{s.domain}</td>
                  <td><span className="fw-badge"><FrameworkIcon name={s.framework} /> {s.framework}</span></td>
                  <td><button className="copy-btn" onClick={() => copy(snippet(s.siteId))}><Copy size={13} /> Copy</button></td>
                  <td>
                    <div className="row-actions">
                      <button className="icon-btn" onClick={() => delSite(s)} title="Delete"><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AppShell>
  );
}
