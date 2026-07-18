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
import Impersonate from "./pages/Impersonate";
import Settings from "./pages/Settings";
import { AppBootSkeleton } from "./components/Skeletons";
import "./App.css";

// While the session is being restored we don't yet know whether to show the app
// or the login page, so hold on a neutral spinner rather than flashing either.

// Protected routes get the workspace context.
function Protected({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <AppBootSkeleton />;
  if (!user) return <Navigate to="/login" replace />;
  return <WorkspaceProvider>{children}</WorkspaceProvider>;
}

function PublicOnly({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <AppBootSkeleton />;
  if (user) return <Navigate to="/app" replace />;
  return <>{children}</>;
}

// Root: send to app if logged in, else to login.
function Root() {
  const { user, loading } = useAuth();
  if (loading) return <AppBootSkeleton />;
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
          <Route path="/app/settings" element={<Protected><Settings /></Protected>} />
          {/* Admin-only, enforced by the page and by every /api/admin route. */}
          <Route path="/app/impersonate" element={<Protected><Impersonate /></Protected>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
