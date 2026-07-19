import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import { AuthProvider, useAuth } from "./auth";
import { WorkspaceProvider, useWorkspace } from "./workspace";
import { DemoProvider } from "./demo";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Home from "./pages/Home";
import Analytics from "./pages/Analytics";
import Workspaces from "./pages/Workspaces";
import Developers from "./pages/Developers";
import Share from "./pages/Share";
import Impersonate from "./pages/Impersonate";
import Settings from "./pages/Settings";
import Onboarding from "./pages/Onboarding";
import PublicDashboard from "./pages/PublicDashboard";
import { AppBootSkeleton } from "./components/Skeletons";
import "./App.css";

// While the session is being restored we don't yet know whether to show the app
// or the login page, so hold on a neutral spinner rather than flashing either.

/**
 * Sends an account with no workspace to first-run setup.
 *
 * This lives inside WorkspaceProvider because it needs the workspace list, and
 * it is a route guard rather than a redirect on the signup button so it holds
 * however someone arrives — a restored session, a bookmark, a direct URL.
 *
 * Skipping setup is respected: `onboarding_skipped` suppresses the redirect so
 * "Skip for now" doesn't bounce straight back here. The Home checklist then
 * carries the remaining steps.
 */
function RequireSetup({ children }: { children: ReactNode }) {
  const { workspaces, loading } = useWorkspace();

  // Don't judge an empty list until it has actually loaded, or every refresh
  // would flash the onboarding screen before the workspaces arrive.
  if (loading) return <AppBootSkeleton />;

  const skipped = localStorage.getItem("quantalog_onboarding_skipped") === "1";
  if (!workspaces.length && !skipped) {
    return <Navigate to="/app/onboarding" replace />;
  }
  return <>{children}</>;
}

// Protected routes get the workspace context, and the setup guard.
function Protected({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <AppBootSkeleton />;
  if (!user) return <Navigate to="/login" replace />;
  return (
    <WorkspaceProvider>
      <RequireSetup>{children}</RequireSetup>
    </WorkspaceProvider>
  );
}

/** Onboarding itself needs the workspace context but must not guard on it. */
function ProtectedRaw({ children }: { children: ReactNode }) {
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
      <DemoProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Root />} />
            <Route path="/login" element={<PublicOnly><Login /></PublicOnly>} />
            <Route path="/signup" element={<PublicOnly><Signup /></PublicOnly>} />
            {/* Shared dashboards: no auth, and deliberately not PublicOnly —
                a signed-in user following a shared link should see the shared
                view, not be bounced to their own dashboard. */}
            <Route path="/share/:token" element={<PublicDashboard />} />
            {/* First-run setup. Protected for the workspace context, but renders
                without the app shell — a new account has nothing to navigate. */}
            <Route path="/app/onboarding" element={<ProtectedRaw><Onboarding /></ProtectedRaw>} />
            <Route path="/app" element={<Protected><Home /></Protected>} />
            <Route path="/app/analytics" element={<Protected><Analytics /></Protected>} />
            <Route path="/app/workspaces" element={<Protected><Workspaces /></Protected>} />
            <Route path="/app/share" element={<Protected><Share /></Protected>} />
            <Route path="/app/developers" element={<Protected><Developers /></Protected>} />
            <Route path="/app/settings" element={<Protected><Settings /></Protected>} />
            {/* Admin-only, enforced by the page and by every /api/admin route. */}
            <Route path="/app/impersonate" element={<Protected><Impersonate /></Protected>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </DemoProvider>
    </AuthProvider>
  );
}
