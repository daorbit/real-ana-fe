import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import { AuthProvider, useAuth } from "./auth";
import { WorkspaceProvider } from "./workspace";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Home from "./pages/Home";
import Analytics from "./pages/Analytics";
import Workspaces from "./pages/Workspaces";
import Developers from "./pages/Developers";
import "./App.css";

// Protected routes get the workspace context.
function Protected({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <p className="muted center">Loading…</p>;
  if (!user) return <Navigate to="/login" replace />;
  return <WorkspaceProvider>{children}</WorkspaceProvider>;
}

function PublicOnly({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <p className="muted center">Loading…</p>;
  if (user) return <Navigate to="/app" replace />;
  return <>{children}</>;
}

// Root: send to app if logged in, else to login.
function Root() {
  const { user, loading } = useAuth();
  if (loading) return <p className="muted center">Loading…</p>;
  return <Navigate to={user ? "/app" : "/login"} replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Root />} />
          <Route path="/login" element={<PublicOnly><Login /></PublicOnly>} />
          <Route path="/signup" element={<PublicOnly><Signup /></PublicOnly>} />
          <Route path="/app" element={<Protected><Home /></Protected>} />
          <Route path="/app/analytics" element={<Protected><Analytics /></Protected>} />
          <Route path="/app/workspaces" element={<Protected><Workspaces /></Protected>} />
          <Route path="/app/developers" element={<Protected><Developers /></Protected>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
