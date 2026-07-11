import type { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { LayoutGrid, LogOut } from "lucide-react";
import { Wordmark } from "./Brand";
import { useAuth } from "../auth";

export function AppShell({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const loc = useLocation();
  const initials = (user?.name ?? "?").slice(0, 2).toUpperCase();

  return (
    <div className="shell">
      <aside className="sidebar">
        <Link to="/app" className="side-brand"><Wordmark /></Link>
        <nav className="side-nav">
          <Link to="/app" className={loc.pathname === "/app" ? "side-link active" : "side-link"}>
            <LayoutGrid size={18} /> Workspaces
          </Link>
        </nav>
        <div className="side-foot">
          <div className="avatar">{initials}</div>
          <div className="side-user">
            <span className="side-name">{user?.name}</span>
            <span className="side-email">{user?.email}</span>
          </div>
          <button className="icon-btn" onClick={logout} title="Log out"><LogOut size={16} /></button>
        </div>
      </aside>
      <main className="shell-main">{children}</main>
    </div>
  );
}
