import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useEffect, type ReactNode } from "react";
import { setNavigate } from "./navigation";
import { AuthProvider, useAuth } from "./auth";
import { WorkspaceProvider, useWorkspace } from "./workspace";
import { DemoProvider } from "./demo";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Home from "./pages/Home";
import Analytics from "./pages/Analytics";
import Seo from "./pages/Seo";
import SeoReportPrint from "./pages/SeoReportPrint";
import Workspaces from "./pages/Workspaces";
import Developers from "./pages/Developers";
import Share from "./pages/Share";
import Reports from "./pages/Reports";
import Impersonate from "./pages/Impersonate";
import DemoUsage from "./pages/DemoUsage";
import Settings from "./pages/Settings";
import Billing from "./pages/Billing";
import AdminBilling from "./pages/AdminBilling";
import AdminBroadcast from "./pages/AdminBroadcast";
import AdminContact from "./pages/AdminContact";
import Onboarding from "./pages/Onboarding";
import PublicDashboard from "./pages/PublicDashboard";
import PublicSeoReport from "./pages/PublicSeoReport";
import { AppBootSkeleton } from "./components/Skeletons";
import "./App.css";
import "./polish.css";

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
 *
 * A missing mobile number is the one thing `skipped` does not excuse. The step
 * that asks for it cannot be skipped, so an account without one either predates
 * that step or left before reaching it — and neither has anywhere else to
 * supply it short of finding the field in Settings.
 *
 * Demo and impersonation sessions are exempt from the guard entirely; see the
 * note at the check.
 */
function RequireSetup({ children }: { children: ReactNode }) {
  const { workspaces, loading } = useWorkspace();
  const { user } = useAuth();

  // Don't judge an empty list until it has actually loaded, or every refresh
  // would flash the onboarding screen before the workspaces arrive.
  if (loading) return <AppBootSkeleton />;

  // Demo accounts are handed out pre-filled and are never a real person, so
  // asking one for a phone number would block a tour on a detail that has
  // nowhere to go.
  //
  // Impersonation is exempt for a different reason: the gap belongs to the
  // account being viewed, and an admin is here to look at it, not to fill in
  // that person's mobile number or create workspaces on their behalf. Sending
  // the admin to onboarding would offer exactly those two things.
  const setupExempt = user?.demo || user?.impersonating;

  if (!user?.mobile && !setupExempt) {
    return <Navigate to="/app/onboarding" replace />;
  }

  const skipped = localStorage.getItem("quantalog_onboarding_skipped") === "1";
  if (!workspaces.length && !skipped && !setupExempt) {
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

/** Captures the router's `navigate` for use outside the component tree — see `navigation.ts`. */
function NavigationCapture() {
  const navigate = useNavigate();
  useEffect(() => setNavigate(navigate), [navigate]);
  return null;
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
          <NavigationCapture />
          <Routes>
            <Route path="/" element={<Root />} />
            <Route path="/login" element={<PublicOnly><Login /></PublicOnly>} />
            <Route path="/signup" element={<PublicOnly><Signup /></PublicOnly>} />
            {/* Shared dashboards: no auth, and deliberately not PublicOnly —
                a signed-in user following a shared link should see the shared
                view, not be bounced to their own dashboard. */}
            <Route path="/share/:token" element={<PublicDashboard />} />
            {/* Public, read-only SEO audit shared per report. Same no-auth,
                token-in-path model as the shared dashboard. */}
            <Route path="/seo-report/:token" element={<PublicSeoReport />} />
            {/* First-run setup. Protected for the workspace context, but renders
                without the app shell — a new account has nothing to navigate. */}
            <Route path="/app/onboarding" element={<ProtectedRaw><Onboarding /></ProtectedRaw>} />
            <Route path="/app" element={<Protected><Home /></Protected>} />
            <Route path="/app/analytics" element={<Protected><Analytics /></Protected>} />
            <Route path="/app/seo" element={<Protected><Seo /></Protected>} />
            {/* Print view: protected for the workspace context, but rendered
                without the app shell — nothing in a client deliverable should
                carry our navigation. */}
            <Route
              path="/app/seo/:siteId/report/:reportId/print"
              element={<ProtectedRaw><SeoReportPrint /></ProtectedRaw>}
            />
            <Route path="/app/workspaces" element={<Protected><Workspaces /></Protected>} />
            <Route path="/app/share" element={<Protected><Share /></Protected>} />
            <Route path="/app/reports" element={<Protected><Reports /></Protected>} />
            <Route path="/app/developers" element={<Protected><Developers /></Protected>} />
            <Route path="/app/settings" element={<Protected><Settings /></Protected>} />
            <Route path="/app/billing" element={<Protected><Billing /></Protected>} />
            {/* Admin-only, enforced by the page and by every /api/admin route. */}
            <Route path="/app/impersonate" element={<Protected><Impersonate /></Protected>} />
            <Route path="/app/demo-usage" element={<Protected><DemoUsage /></Protected>} />
            <Route path="/app/admin/billing" element={<Protected><AdminBilling /></Protected>} />
            <Route path="/app/admin/broadcast" element={<Protected><AdminBroadcast /></Protected>} />
            <Route path="/app/admin/contact" element={<Protected><AdminContact /></Protected>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </DemoProvider>
    </AuthProvider>
  );
}
