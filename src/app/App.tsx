import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useEffect, type ReactNode } from "react";
import { setNavigate } from "@/app/navigation";
import { AuthProvider, useAuth } from "@/features/auth/context";
import { WorkspaceProvider, useWorkspace } from "@/features/workspace/context";
import { DemoProvider } from "@/features/demo/context";
import Login from "@/features/auth/pages/Login";
import ForgotPassword from "@/features/auth/pages/ForgotPassword";
import Signup from "@/features/auth/pages/Signup";
import Home from "@/features/analytics/pages/Home";
import Analytics from "@/features/analytics/pages/Analytics";
import Seo from "@/features/seo/pages/Seo";
import Compare from "@/features/compare/pages/Compare";
import SeoReportPrint from "@/features/seo/pages/SeoReportPrint";
import Workspaces from "@/features/workspace/pages/Workspaces";
import Developers from "@/features/support/pages/Developers";
import Help from "@/features/support/pages/Help";
import { OrbitProvider } from "@/features/orbit/components/OrbitProvider";
import Members from "@/features/workspace/pages/Members";
import AcceptInvite from "@/features/workspace/pages/AcceptInvite";
import Share from "@/features/analytics/pages/Share";
import Reports from "@/features/reports/pages";
import SocialPosts from "@/features/social/pages/SocialPosts";
import LeadCapture from "@/features/leadCapture/pages/LeadCapture";
import Impersonate from "@/features/admin/pages/Impersonate";
import DemoUsage from "@/features/admin/pages/DemoUsage";
import Settings from "@/features/auth/pages/Settings";
import DataDeletion from "@/features/auth/pages/DataDeletion";
import Billing from "@/features/billing/pages/Billing";
import AdminBilling from "@/features/admin/pages/AdminBilling";
import AdminBroadcast from "@/features/admin/pages/AdminBroadcast";
import AdminContact from "@/features/admin/pages/AdminContact";
import Onboarding from "@/features/auth/pages/Onboarding";
import PublicDashboard from "@/features/analytics/pages/PublicDashboard";
import PublicSeoReport from "@/features/seo/pages/PublicSeoReport";
import { AppBootSkeleton } from "@/shared/ui/Skeletons";
import "@/app/App.css";
import "@/polish.css";

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
      {/* Orbit's conversation is only ever in memory, so where the provider
          sits decides how long it lives: here, it survives navigation between
          pages and ends with the session. */}
      <OrbitProvider>
        <RequireSetup>{children}</RequireSetup>
      </OrbitProvider>
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
  if (user) {
    // Someone who arrived from an invitation link goes back to it rather than
    // to their dashboard — otherwise signing in to accept an invite silently
    // drops the invite, and the link has to be found in their inbox again.
    // Handled here rather than in each form so it covers password sign-in,
    // signup, and the Google round trip alike.
    const pending = sessionStorage.getItem("pendingInvite");
    if (pending) return <Navigate to={pending} replace />;
    return <Navigate to="/app" replace />;
  }
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
            <Route path="/forgot-password" element={<PublicOnly><ForgotPassword /></PublicOnly>} />
            {/* Shared dashboards: no auth, and deliberately not PublicOnly —
                a signed-in user following a shared link should see the shared
                view, not be bounced to their own dashboard. */}
            <Route path="/share/:token" element={<PublicDashboard />} />
            {/* Neither Protected nor PublicOnly: the page has to work for someone
                already signed in (accept now) and for someone who isn't (see who
                invited them, then sign in or sign up). */}
            <Route path="/invite/:token" element={<AcceptInvite />} />
            {/* Public, read-only SEO audit shared per report. Same no-auth,
                token-in-path model as the shared dashboard. */}
            <Route path="/seo-report/:token" element={<PublicSeoReport />} />
            {/* Where Meta's data-deletion callback sends someone to check what
                happened to their request. Public by necessity: whoever deleted
                their Instagram connection may have no account here at all, and
                a sign-in wall in front of a deletion receipt is the wrong ask. */}
            <Route path="/data-deletion" element={<DataDeletion />} />
            {/* First-run setup. Protected for the workspace context, but renders
                without the app shell — a new account has nothing to navigate. */}
            <Route path="/app/onboarding" element={<ProtectedRaw><Onboarding /></ProtectedRaw>} />
            <Route path="/app" element={<Protected><Home /></Protected>} />
            <Route path="/app/analytics" element={<Protected><Analytics /></Protected>} />
            <Route path="/app/seo" element={<Protected><Seo /></Protected>} />
            <Route path="/app/compare" element={<Protected><Compare /></Protected>} />
            {/* Print view: protected for the workspace context, but rendered
                without the app shell — nothing in a client deliverable should
                carry our navigation. */}
            <Route
              path="/app/seo/:siteId/report/:reportId/print"
              element={<ProtectedRaw><SeoReportPrint /></ProtectedRaw>}
            />
            <Route path="/app/workspaces" element={<Protected><Workspaces /></Protected>} />
            <Route path="/app/members" element={<Protected><Members /></Protected>} />
            <Route path="/app/share" element={<Protected><Share /></Protected>} />
            <Route path="/app/reports" element={<Protected><Reports /></Protected>} />
            <Route path="/app/social" element={<Protected><SocialPosts /></Protected>} />
            <Route path="/app/lead-capture" element={<Protected><LeadCapture /></Protected>} />
            <Route path="/app/developers" element={<Protected><Developers /></Protected>} />
            <Route path="/app/help" element={<Protected><Help /></Protected>} />
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
