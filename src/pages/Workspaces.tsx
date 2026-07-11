import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../auth";
import type { Workspace } from "../types";

export default function Workspaces() {
  const { user, logout } = useAuth();
  const [list, setList] = useState<Workspace[]>([]);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const load = () =>
    api.get<Workspace[]>("/api/workspaces").then(setList).catch((e) => setError(e.message));

  useEffect(() => {
    load();
  }, []);

  const create = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await api.post<Workspace>("/api/workspaces", { name });
      setName("");
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "failed");
    }
  };

  return (
    <div className="page">
      <header className="topbar">
        <h1>Workspaces</h1>
        <div className="spacer" />
        <span className="muted">{user?.email}</span>
        <button className="ghost" onClick={logout}>Log out</button>
      </header>

      {error && <p className="error">{error}</p>}

      <form className="inline-form" onSubmit={create}>
        <input placeholder="New workspace name" value={name} onChange={(e) => setName(e.target.value)} required />
        <button type="submit">Create</button>
      </form>

      <div className="grid">
        {list.map((w) => (
          <Link key={w._id} to={`/workspaces/${w._id}`} className="card link-card">
            <h3>{w.name}</h3>
            <span className="muted">/{w.slug}</span>
          </Link>
        ))}
        {list.length === 0 && <p className="muted">No workspaces yet. Create one above.</p>}
      </div>
    </div>
  );
}
