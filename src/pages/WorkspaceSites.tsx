import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, ArrowLeft, Check, Copy, ChevronRight } from "lucide-react";
import { api, API_ORIGIN } from "../api";
import { AppShell } from "../components/AppShell";
import { FrameworkIcon } from "../components/Brand";
import type { Site } from "../types";

const FRAMEWORKS = ["react", "vue", "angular", "svelte", "other"];

export default function WorkspaceSites() {
  const { wid } = useParams();
  const [sites, setSites] = useState<Site[]>([]);
  const [name, setName] = useState("");
  const [domain, setDomain] = useState("");
  const [framework, setFramework] = useState("react");
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<Site | null>(null);
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);

  const load = () =>
    api.get<Site[]>(`/api/workspaces/${wid}/sites`).then(setSites).catch((e) => setError(e.message));

  useEffect(() => { load(); }, [wid]);

  const create = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const site = await api.post<Site>(`/api/workspaces/${wid}/sites`, { name, domain, framework });
      setName(""); setDomain(""); setOpen(false);
      setCreated(site);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "failed");
    }
  };

  const snippet = (siteId: string) =>
    `<script async src="${API_ORIGIN}/tracker.js" data-site="${siteId}"></script>`;

  const copy = (s: string) => {
    navigator.clipboard.writeText(s);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  return (
    <AppShell>
      <div className="page-head">
        <div>
          <Link to="/app" className="back-link"><ArrowLeft size={14} /> Workspaces</Link>
          <h1>Sites</h1>
          <p className="muted">Each site gets its own tracking script and dashboard.</p>
        </div>
        <button className="btn-primary" onClick={() => setOpen((v) => !v)}><Plus size={16} /> Add site</button>
      </div>

      {error && <p className="error-box">{error}</p>}

      {open && (
        <motion.form className="quick-form wrap" onSubmit={create} initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
          <input autoFocus placeholder="Site name" value={name} onChange={(e) => setName(e.target.value)} required />
          <input placeholder="domain.com" value={domain} onChange={(e) => setDomain(e.target.value)} required />
          <select value={framework} onChange={(e) => setFramework(e.target.value)}>
            {FRAMEWORKS.map((f) => <option key={f} value={f}>{f}</option>)}
          </select>
          <button type="submit" className="btn-primary">Create</button>
        </motion.form>
      )}

      {created && (
        <motion.div className="snippet-card" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}>
          <div className="snippet-head">
            <span className="ok-badge"><Check size={14} /> {created.name} created</span>
            <span className="muted">Paste this before <code>&lt;/head&gt;</code></span>
          </div>
          <div className="snippet-code">
            <code>{snippet(created.siteId)}</code>
            <button className="copy-btn" onClick={() => copy(snippet(created.siteId))}>
              {copied ? <><Check size={14} /> Copied</> : <><Copy size={14} /> Copy</>}
            </button>
          </div>
        </motion.div>
      )}

      <div className="card-grid">
        {sites.map((s, i) => (
          <motion.div key={s._id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Link to={`/sites/${s.siteId}`} className="tile">
              <div className="tile-body">
                <h3>{s.name}</h3>
                <span className="muted">{s.domain}</span>
                <span className="fw-badge"><FrameworkIcon name={s.framework} /> {s.framework}</span>
              </div>
              <ChevronRight size={18} className="tile-arrow" />
            </Link>
          </motion.div>
        ))}
        {sites.length === 0 && !open && (
          <div className="empty">
            <p>No sites yet.</p>
            <button className="btn-primary" onClick={() => setOpen(true)}><Plus size={16} /> Add your first site</button>
          </div>
        )}
      </div>
    </AppShell>
  );
}
