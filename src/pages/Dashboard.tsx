import { useEffect, useState, useCallback } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import { ArrowLeft, Users, Eye, Radio } from "lucide-react";
import { api } from "../api";
import { AppShell } from "../components/AppShell";
import type { Stats, Bucket } from "../types";

const RANGES = ["1h", "24h", "7d", "30d"];

// Validated dark categorical palette (dataviz skill). Chart primary = blue.
const CHART = "#3987e5";

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

function KpiTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tip">
      <span className="tip-label">{label}</span>
      <span className="tip-val">{payload[0].value} views</span>
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

  const kpis = stats
    ? [
        { icon: Users, label: "Visitors", val: stats.visitors, live: false },
        { icon: Eye, label: "Pageviews", val: stats.pageviews, live: false },
        { icon: Radio, label: "Live now", val: stats.live, live: true },
      ]
    : [];

  return (
    <AppShell>
      <div className="page-head">
        <div>
          <Link to="/app" className="back-link"><ArrowLeft size={14} /> Workspaces</Link>
          <h1>Analytics</h1>
        </div>
        <div className="range-tabs">
          {RANGES.map((r) => (
            <button key={r} className={r === range ? "active" : ""} onClick={() => setRange(r)}>{r}</button>
          ))}
        </div>
      </div>

      {error && <p className="error-box">{error}</p>}
      {!stats ? (
        <div className="skeleton-grid">
          {[0, 1, 2].map((i) => <div key={i} className="skeleton kpi-sk" />)}
          <div className="skeleton chart-sk" />
        </div>
      ) : (
        <>
          <div className="kpi-row">
            {kpis.map((k, i) => (
              <motion.div key={k.label} className={`kpi ${k.live ? "live" : ""}`}
                initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                <div className="kpi-icon"><k.icon size={18} /></div>
                <span className="kpi-val">{k.val.toLocaleString()}</span>
                <span className="kpi-label">
                  {k.live && <span className="dot-live" />}{k.label}
                </span>
              </motion.div>
            ))}
          </div>

          <div className="panel chart-panel">
            <h3 className="panel-title">Pageviews over time</h3>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={stats.timeseries} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                <defs>
                  <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={CHART} stopOpacity={0.45} />
                    <stop offset="95%" stopColor={CHART} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2e3a" vertical={false} />
                <XAxis dataKey="bucket" tick={{ fontSize: 11, fill: "#8b90a0" }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#8b90a0" }} allowDecimals={false} tickLine={false} axisLine={false} />
                <Tooltip content={<KpiTooltip />} cursor={{ stroke: "#3987e5", strokeWidth: 1 }} />
                <Area type="monotone" dataKey="views" stroke={CHART} strokeWidth={2.5} fill="url(#g)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="panel-grid">
            <BarList title="Top Pages" items={stats.topPages} />
            <BarList title="Top Referrers" items={stats.topReferrers} />
            <BarList title="Devices" items={stats.devices} />
            <BarList title="Countries" items={stats.countries} />
            <BarList title="UTM Sources" items={stats.utmSources} />
          </div>
        </>
      )}
    </AppShell>
  );
}
