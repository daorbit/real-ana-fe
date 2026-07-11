import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import { api, API_ORIGIN } from "../api";
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

  const load = () =>
    api.get<Site[]>(`/api/workspaces/${wid}/sites`).then(setSites).catch((e) => setError(e.message));

  useEffect(() => {
    load();
  }, [wid]);

  const create = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const site = await api.post<Site>(`/api/workspaces/${wid}/sites`, { name, domain, framework });
      setName("");
      setDomain("");
      setCreated(site);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "failed");
    }
  };

  const snippet = (siteId: string) =>
    `<script async src="${API_ORIGIN}/tracker.js" data-site="${siteId}"></script>`;

  return (
    <div className="page">
      <header className="topbar">
        <Link to="/" className="ghost">← Workspaces</Link>
        <h1>Sites</h1>
      </header>

      {error && <p className="error">{error}</p>}

      <form className="inline-form" onSubmit={create}>
        <input placeholder="Site name" value={name} onChange={(e) => setName(e.target.value)} required />
        <input placeholder="domain.com" value={domain} onChange={(e) => setDomain(e.target.value)} required />
        <select value={framework} onChange={(e) => setFramework(e.target.value)}>
          {FRAMEWORKS.map((f) => <option key={f} value={f}>{f}</option>)}
        </select>
        <button type="submit">Add site</button>
      </form>

      {created && (
        <div className="snippet-box">
          <p><strong>{created.name}</strong> created. Paste this before <code>&lt;/head&gt;</code>:</p>
          <pre>{snippet(created.siteId)}</pre>
          <button className="ghost" onClick={() => navigator.clipboard.writeText(snippet(created.siteId))}>Copy</button>
        </div>
      )}

      <div className="grid">
        {sites.map((s) => (
          <Link key={s._id} to={`/sites/${s.siteId}`} className="card link-card">
            <h3>{s.name}</h3>
            <span className="muted">{s.domain}</span>
            <span className="badge">{s.framework}</span>
          </Link>
        ))}
        {sites.length === 0 && <p className="muted">No sites yet. Add one above.</p>}
      </div>
    </div>
  );
}
