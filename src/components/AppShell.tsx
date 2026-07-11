import type { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, BarChart3, FolderKanban, LogOut } from "lucide-react";
import { Wordmark } from "./Brand";
import { useAuth } from "../auth";
import { useWorkspace } from "../workspace";

const NAV = [
  { to: "/app", label: "Home", icon: Home },
  { to: "/app/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/app/workspaces", label: "Workspaces", icon: FolderKanban },
];

export function AppShell({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const { workspaces, active, setActive } = useWorkspace();
  const loc = useLocation();
  const initials = (user?.name ?? "?").slice(0, 2).toUpperCase();

  return (
    <div className="shell">
      <aside className="sidebar">
        <Link to="/app" className="side-brand"><Wordmark /></Link>

        {workspaces.length > 0 && (
          <div className="ws-switch">
            <label>Workspace</label>
            <select value={active?._id ?? ""} onChange={(e) => setActive(e.target.value)}>
              {workspaces.map((w) => <option key={w._id} value={w._id}>{w.name}</option>)}
            </select>
          </div>
        )}

        <nav className="side-nav">
          {NAV.map((n) => {
            const isActive = loc.pathname === n.to;
            return (
              <Link key={n.to} to={n.to} className={isActive ? "side-link active" : "side-link"}>
                <n.icon size={17} /> {n.label}
              </Link>
            );
          })}
        </nav>

        <div className="side-foot">
          <div className="avatar">{initials}</div>
          <div className="side-user">
            <span className="side-name">{user?.name}</span>
            <span className="side-email">{user?.email}</span>
          </div>
          <button className="icon-btn" onClick={logout} title="Log out"><LogOut size={15} /></button>
        </div>
      </aside>
      <main className="shell-main">{children}</main>
    </div>
  );
}
