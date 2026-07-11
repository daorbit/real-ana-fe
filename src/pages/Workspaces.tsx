import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, Folder, ChevronRight } from "lucide-react";
import { api } from "../api";
import { AppShell } from "../components/AppShell";
import type { Workspace } from "../types";

export default function Workspaces() {
  const [list, setList] = useState<Workspace[]>([]);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const load = () =>
    api.get<Workspace[]>("/api/workspaces").then(setList).catch((e) => setError(e.message));

  useEffect(() => { load(); }, []);

  const create = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await api.post<Workspace>("/api/workspaces", { name });
      setName("");
      setOpen(false);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "failed");
    }
  };

  return (
    <AppShell>
      <div className="page-head">
        <div>
          <h1>Workspaces</h1>
          <p className="muted">Group the apps you want to track.</p>
        </div>
        <button className="btn-primary" onClick={() => setOpen((v) => !v)}><Plus size={16} /> New workspace</button>
      </div>

      {error && <p className="error-box">{error}</p>}

      {open && (
        <motion.form className="quick-form" onSubmit={create} initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
          <input autoFocus placeholder="e.g. Acme Inc" value={name} onChange={(e) => setName(e.target.value)} required />
          <button type="submit" className="btn-primary">Create</button>
        </motion.form>
      )}

      <div className="card-grid">
        {list.map((w, i) => (
          <motion.div key={w._id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Link to={`/workspaces/${w._id}`} className="tile">
              <div className="tile-icon"><Folder size={20} /></div>
              <div className="tile-body">
                <h3>{w.name}</h3>
                <span className="muted">/{w.slug}</span>
              </div>
              <ChevronRight size={18} className="tile-arrow" />
            </Link>
          </motion.div>
        ))}
        {list.length === 0 && !open && (
          <div className="empty">
            <Folder size={40} />
            <p>No workspaces yet.</p>
            <button className="btn-primary" onClick={() => setOpen(true)}><Plus size={16} /> Create your first</button>
          </div>
        )}
      </div>
    </AppShell>
  );
}
