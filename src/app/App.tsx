import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useRef, lazy, Suspense, type ReactNode } from "react";
import { setNavigate } from "@/app/navigation";
import { trace } from "@/shared/lib/analytics";
import { AuthProvider, useAuth } from "@/features/auth/context";
import { WorkspaceProvider, useWorkspace } from "@/features/workspace/context";
import { DemoProvider } from "@/features/demo/context";
import { OrbitProvider } from "@/features/orbit/components/OrbitProvider";
import { ErrorBoundary } from "@/shared/ui/ErrorBoundary";
import { NotFound } from "@/shared/ui/NotFound";
import { AppBootSkeleton } from "@/shared/ui/Skeletons";
import "@/app/App.css";
import "@/polish.css";

// Auth screens load eagerly: they are the first thing a signed-out visitor
// sees, and a chunk fetch there would show a blank frame before the form.
import Login from "@/features/auth/pages/Login";
import ForgotPassword from "@/features/auth/pages/ForgotPassword";
import Signup from "@/features/auth/pages/Signup";
import Home from "@/features/analytics/pages/Home";

// Everything else is split out — most sessions touch only a few of these, and
// the admin, print and journey routes are dead weight for almost everyone.
const Analytics = lazy(() => import("@/features/analytics/pages/Analytics"));
const Seo = lazy(() => import("@/features/seo/pages/Seo"));
const Compare = lazy(() => import("@/features/compare/pages/Compare"));
const SeoReportPrint = lazy(() => import("@/features/seo/pages/SeoReportPrint"));
const Workspaces = lazy(() => import("@/features/workspace/pages/Workspaces"));
const Developers = lazy(() => import("@/features/support/pages/Developers"));
const Help = lazy(() => import("@/features/support/pages/Help"));
const Members = lazy(() => import("@/features/workspace/pages/Members"));
const AcceptInvite = lazy(() => import("@/features/workspace/pages/AcceptInvite"));
const Share = lazy(() => import("@/features/analytics/pages/Share"));
const Reports = lazy(() => import("@/features/reports/pages"));
const Journey = lazy(() => import("@/features/journey/pages/Journey"));
const JourneyTimeline = lazy(() => import("@/features/journey/pages/JourneyTimeline"));
const SocialPosts = lazy(() => import("@/features/social/pages/SocialPosts"));
const LeadCapture = lazy(() => import("@/features/leadCapture/pages/LeadCapture"));
const Impersonate = lazy(() => import("@/features/admin/pages/Impersonate"));
const DemoUsage = lazy(() => import("@/features/admin/pages/DemoUsage"));
const Settings = lazy(() => import("@/features/auth/pages/Settings"));
const DataDeletion = lazy(() => import("@/features/auth/pages/DataDeletion"));
const Billing = lazy(() => import("@/features/billing/pages/Billing"));
const AdminBilling = lazy(() => import("@/features/admin/pages/AdminBilling"));
const AdminBroadcast = lazy(() => import("@/features/admin/pages/AdminBroadcast"));
const AdminContact = lazy(() => import("@/features/admin/pages/AdminContact"));
const Onboarding = lazy(() => import("@/features/auth/pages/Onboarding"));
const PublicDashboard = lazy(() => import("@/features/analytics/pages/PublicDashboard"));
const PublicSeoReport = lazy(() => import("@/features/seo/pages/PublicSeoReport"));

function RequireSetup({ children }: { children: ReactNode }) {
  const { workspaces, loading } = useWorkspace();
  const { user } = useAuth();

  if (loading) return <AppBootSkeleton />;

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

function Protected({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <AppBootSkeleton />;
  if (!user) return <Navigate to="/login" replace />;
  return (
    <WorkspaceProvider>
      <OrbitProvider>
        <RequireSetup>{children}</RequireSetup>
      </OrbitProvider>
    </WorkspaceProvider>
  );
}

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
    const pending = sessionStorage.getItem("pendingInvite");
    if (pending) return <Navigate to={pending} replace />;
    return <Navigate to="/app" replace />;
  }
  return <>{children}</>;
}

function NavigationCapture() {
  const navigate = useNavigate();
  useEffect(() => setNavigate(navigate), [navigate]);
  return null;
}

/**
 * Moves focus to the page's <h1> on every client-side navigation.
 *
 * An SPA route change swaps the DOM but leaves focus where it was — on a nav
 * link the user just clicked, or nowhere. A screen-reader or keyboard user then
 * starts the new page from the middle of the old one. Focusing the heading (or
 * <main> as a fallback) puts them at the top of what actually changed, and the
 * `tabIndex=-1` is removed on blur so it never becomes a lingering tab stop.
 */
function FocusOnRouteChange() {
  const { pathname } = useLocation();
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const target =
      (document.querySelector("main h1, h1") as HTMLElement | null) ??
      (document.querySelector("main") as HTMLElement | null);
    if (!target) return;
    target.setAttribute("tabindex", "-1");
    target.focus({ preventScroll: false });
    const drop = () => {
      target.removeAttribute("tabindex");
      target.removeEventListener("blur", drop);
    };
    target.addEventListener("blur", drop);
  }, [pathname]);

  return null;
}

/**
 * A route-level error boundary that re-mounts its subtree on navigation, so a
 * crash on one page doesn't stick when the user moves to another. Also wraps
 * every lazy route in one Suspense fallback.
 */
function RouteFrame({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  return (
    <ErrorBoundary variant="route" resetKey={pathname}>
      <Suspense fallback={<AppBootSkeleton />}>{children}</Suspense>
    </ErrorBoundary>
  );
}

/**
 * Traces every screen change for a logged-in user, so the journey is
 * continuous rather than only the clicks that happened to get instrumented
 * individually — src is the page just left, dest is the page landed on.
 * A page reached by typing a URL or refreshing has no previous path in this
 * tab, so it traces with an empty src rather than a stale one.
 */
function JourneyRouteTracer() {
  const location = useLocation();
  const { user } = useAuth();
  const prevPath = useRef<string | null>(null);
  // What was last actually sent, rather than what was last rendered. Two things
  // otherwise send the same screen twice: `user?.id` is a dependency, so
  // signing in re-runs this for the page already on screen, and StrictMode
  // double-invokes the effect on mount in development.
  const lastSent = useRef<string | null>(null);

  useEffect(() => {
    if (!user?.id) return;

    const key = `${user.id}:${location.pathname}`;
    if (lastSent.current === key) return;
    lastSent.current = key;

    trace(user.id, "page_view", prevPath.current ?? "", location.pathname);
    prevPath.current = location.pathname;
  }, [location.pathname, user?.id]);

  return null;
}

// Dogfooding: quantalog's own dashboard runs its own anonymous tracker.
// Pageviews need no per-page wiring — tracker.js patches pushState/
// replaceState so BrowserRouter navigation is already an SPA route change
// it understands. Identified journey tracing (trace() calls at click sites,
// see shared/lib/analytics.ts) is separate and needs no mount here — each
// call carries the logged-in user's id itself.
function SelfTracking() {
  useEffect(() => {
    const s = document.createElement("script");
    s.src = "https://quantalog-be.daorbit.in/tracker.js";
    s.async = true;
    s.dataset.site = "3EaS4tOSHyVG0irS";
    document.head.appendChild(s);
    return () => { document.head.removeChild(s); };
  }, []);

  return null;
}

function Root() {
  const { user, loading } = useAuth();
  if (loading) return <AppBootSkeleton />;
  return <Navigate to={user ? "/app" : "/login"} replace />;
}

export default function App() {
  return (
    <ErrorBoundary variant="app">
      <AuthProvider>
        <DemoProvider>
          <BrowserRouter>
            <SelfTracking />
            <NavigationCapture />
            <FocusOnRouteChange />
            <JourneyRouteTracer />
            <Routes>
              <Route path="/" element={<Root />} />
              <Route path="/login" element={<PublicOnly><Login /></PublicOnly>} />
              <Route path="/signup" element={<PublicOnly><Signup /></PublicOnly>} />
              <Route path="/forgot-password" element={<PublicOnly><ForgotPassword /></PublicOnly>} />
              <Route path="/share/:token" element={<RouteFrame><PublicDashboard /></RouteFrame>} />
              <Route path="/invite/:token" element={<RouteFrame><AcceptInvite /></RouteFrame>} />
              <Route path="/seo-report/:token" element={<RouteFrame><PublicSeoReport /></RouteFrame>} />
              <Route path="/data-deletion" element={<RouteFrame><DataDeletion /></RouteFrame>} />
              <Route path="/app/onboarding" element={<ProtectedRaw><RouteFrame><Onboarding /></RouteFrame></ProtectedRaw>} />
              <Route path="/app" element={<Protected><ErrorBoundary variant="route" resetKey="/app"><Home /></ErrorBoundary></Protected>} />
              <Route path="/app/analytics" element={<Protected><RouteFrame><Analytics /></RouteFrame></Protected>} />
              <Route path="/app/seo" element={<Protected><RouteFrame><Seo /></RouteFrame></Protected>} />
              <Route path="/app/compare" element={<Protected><RouteFrame><Compare /></RouteFrame></Protected>} />
              <Route
                path="/app/seo/:siteId/report/:reportId/print"
                element={<ProtectedRaw><RouteFrame><SeoReportPrint /></RouteFrame></ProtectedRaw>}
              />
              <Route path="/app/workspaces" element={<Protected><RouteFrame><Workspaces /></RouteFrame></Protected>} />
              <Route path="/app/members" element={<Protected><RouteFrame><Members /></RouteFrame></Protected>} />
              <Route path="/app/share" element={<Protected><RouteFrame><Share /></RouteFrame></Protected>} />
              <Route path="/app/reports" element={<Protected><RouteFrame><Reports /></RouteFrame></Protected>} />
              <Route path="/app/journey" element={<Protected><RouteFrame><Journey /></RouteFrame></Protected>} />
              <Route path="/app/journey/:appUserId" element={<Protected><RouteFrame><JourneyTimeline /></RouteFrame></Protected>} />
              <Route path="/app/social" element={<Protected><RouteFrame><SocialPosts /></RouteFrame></Protected>} />
              <Route path="/app/lead-capture" element={<Protected><RouteFrame><LeadCapture /></RouteFrame></Protected>} />
              <Route path="/app/developers" element={<Protected><RouteFrame><Developers /></RouteFrame></Protected>} />
              <Route path="/app/help" element={<Protected><RouteFrame><Help /></RouteFrame></Protected>} />
              <Route path="/app/settings" element={<Protected><RouteFrame><Settings /></RouteFrame></Protected>} />
              <Route path="/app/billing" element={<Protected><RouteFrame><Billing /></RouteFrame></Protected>} />
              {/* Admin-only, enforced by the page and by every /api/admin route. */}
              <Route path="/app/impersonate" element={<Protected><RouteFrame><Impersonate /></RouteFrame></Protected>} />
              <Route path="/app/demo-usage" element={<Protected><RouteFrame><DemoUsage /></RouteFrame></Protected>} />
              <Route path="/app/admin/billing" element={<Protected><RouteFrame><AdminBilling /></RouteFrame></Protected>} />
              <Route path="/app/admin/broadcast" element={<Protected><RouteFrame><AdminBroadcast /></RouteFrame></Protected>} />
              <Route path="/app/admin/contact" element={<Protected><RouteFrame><AdminContact /></RouteFrame></Protected>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </DemoProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
