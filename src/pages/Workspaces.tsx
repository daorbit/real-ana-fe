import { useState } from "react";
import type { FormEvent } from "react";
import { Plus, LayoutGrid, Table2, Trash2, Pencil, Check, X, FolderKanban } from "lucide-react";
import { api } from "../api";
import { AppShell } from "../components/AppShell";
import { useWorkspace } from "../workspace";
import type { Workspace } from "../types";

export default function Workspaces() {
  const { workspaces, active, setActive, refresh, loading } = useWorkspace();
  const [view, setView] = useState<"table" | "card">("table");
  const [name, setName] = useState("");
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const create = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const ws = await api.post<Workspace>("/api/workspaces", { name });
      setName(""); setOpen(false);
      await refresh();
      setActive(ws._id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "failed");
    }
  };

  const saveEdit = async (id: string) => {
    try {
      await api.patch(`/api/workspaces/${id}`, { name: editName });
      setEditId(null);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "failed");
    }
  };

  const remove = async (id: string, wsName: string) => {
    if (!confirm(`Delete "${wsName}" and all its sites + analytics? This cannot be undone.`)) return;
    try {
      await api.del(`/api/workspaces/${id}`);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "failed");
    }
  };

  return (
    <AppShell>
      <div className="page-head">
        <div>
          <h1>Workspaces</h1>
          <p className="muted">Create, rename or remove the workspaces that group your apps.</p>
        </div>
        <div className="head-actions">
          <div className="view-toggle">
            <button className={view === "table" ? "active" : ""} onClick={() => setView("table")} title="Table"><Table2 size={16} /></button>
            <button className={view === "card" ? "active" : ""} onClick={() => setView("card")} title="Cards"><LayoutGrid size={16} /></button>
          </div>
          <button className="btn-primary" onClick={() => setOpen((v) => !v)}><Plus size={16} /> New</button>
        </div>
      </div>

      {error && <p className="error-box" style={{ marginBottom: "1rem" }}>{error}</p>}

      {open && (
        <form className="quick-form" onSubmit={create}>
          <input autoFocus placeholder="e.g. Acme Inc" value={name} onChange={(e) => setName(e.target.value)} required />
          <button type="submit" className="btn-primary">Create</button>
          <button type="button" className="btn-ghost" onClick={() => setOpen(false)}>Cancel</button>
        </form>
      )}

      {loading ? (
        <p className="muted">Loading…</p>
      ) : workspaces.length === 0 && !open ? (
        <div className="empty">
          <FolderKanban size={40} />
          <p>No workspaces yet.</p>
          <button className="btn-primary" onClick={() => setOpen(true)}><Plus size={16} /> Create your first</button>
        </div>
      ) : view === "table" ? (
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Name</th><th>Slug</th><th>Created</th><th style={{ textAlign: "right" }}>Actions</th></tr>
            </thead>
            <tbody>
              {workspaces.map((w) => (
                <tr key={w._id}>
                  <td>
                    {editId === w._id ? (
                      <input value={editName} onChange={(e) => setEditName(e.target.value)} style={{ maxWidth: 220 }} autoFocus />
                    ) : (
                      <span className="row-name link-cell" onClick={() => setActive(w._id)}>
                        {w.name}{active?._id === w._id && <span className="muted"> · active</span>}
                      </span>
                    )}
                  </td>
                  <td className="muted">/{w.slug}</td>
                  <td className="muted">{new Date(w.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div className="row-actions">
                      {editId === w._id ? (
                        <>
                          <button className="icon-btn" onClick={() => saveEdit(w._id)} title="Save"><Check size={15} /></button>
                          <button className="icon-btn" onClick={() => setEditId(null)} title="Cancel"><X size={15} /></button>
                        </>
                      ) : (
                        <>
                          <button className="icon-btn" onClick={() => { setEditId(w._id); setEditName(w.name); }} title="Rename"><Pencil size={15} /></button>
                          <button className="icon-btn" onClick={() => remove(w._id, w.name)} title="Delete"><Trash2 size={15} /></button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="card-grid">
          {workspaces.map((w) => (
            <div key={w._id} className="tile">
              <div className="tile-icon"><FolderKanban size={18} /></div>
              <div className="tile-body">
                <h3>{w.name}{active?._id === w._id && <span className="muted"> · active</span>}</h3>
                <span className="muted">/{w.slug}</span>
              </div>
              <div className="row-actions">
                <button className="icon-btn" onClick={() => setActive(w._id)} title="Set active"><Check size={15} /></button>
                <button className="icon-btn" onClick={() => remove(w._id, w.name)} title="Delete"><Trash2 size={15} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </AppShell>
  );
}
