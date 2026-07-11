import { useEffect, useState, useCallback } from "react";
import { Link, useParams } from "react-router-dom";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import { api } from "../api";
import type { Stats, Bucket } from "../types";

const RANGES = ["1h", "24h", "7d", "30d"];

function BarList({ title, items }: { title: string; items: Bucket[] }) {
  const max = Math.max(1, ...items.map((i) => i.count));
  return (
    <div className="card list-card">
      <h3>{title}</h3>
      {items.length === 0 && <p className="muted">No data</p>}
      {items.map((i) => (
        <div key={i.key} className="bar-row">
          <div className="bar-fill" style={{ width: `${(i.count / max) * 100}%` }} />
          <span className="bar-label">{i.key}</span>
          <span className="bar-count">{i.count}</span>
        </div>
      ))}
    </div>
  );
}

export default function Dashboard() {
  const { siteId } = useParams();
  const [range, setRange] = useState("24h");
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    api.get<Stats>(`/api/sites/${siteId}/stats?range=${range}`)
      .then((s) => { setStats(s); setError(null); })
      .catch((e) => setError(e.message));
  }, [siteId, range]);

  useEffect(() => {
    load();
    const id = setInterval(load, 3000);
    return () => clearInterval(id);
  }, [load]);

  return (
    <div className="page">
      <header className="topbar">
        <Link to="/" className="ghost">← Workspaces</Link>
        <h1>Analytics</h1>
        <div className="spacer" />
        <div className="range-tabs">
          {RANGES.map((r) => (
            <button key={r} className={r === range ? "active" : ""} onClick={() => setRange(r)}>{r}</button>
          ))}
        </div>
      </header>

      {error && <p className="error">{error}</p>}
      {!stats ? <p className="muted">Loading…</p> : (
        <>
          <div className="kpis">
            <div className="kpi"><span className="kpi-val">{stats.visitors}</span><span className="kpi-label">Visitors</span></div>
            <div className="kpi"><span className="kpi-val">{stats.pageviews}</span><span className="kpi-label">Pageviews</span></div>
            <div className="kpi live"><span className="kpi-val">{stats.live}</span><span className="kpi-label">Live now</span></div>
          </div>

          <div className="card chart-card">
            <h3>Pageviews over time</h3>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={stats.timeseries}>
                <defs>
                  <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="bucket" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip />
                <Area type="monotone" dataKey="views" stroke="#6366f1" fill="url(#g)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="grid">
            <BarList title="Top Pages" items={stats.topPages} />
            <BarList title="Top Referrers" items={stats.topReferrers} />
            <BarList title="Devices" items={stats.devices} />
            <BarList title="Countries" items={stats.countries} />
            <BarList title="UTM Sources" items={stats.utmSources} />
          </div>
        </>
      )}
    </div>
  );
}
