import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useRef, useState, lazy, Suspense, type ReactNode } from "react";
import { setNavigate } from "@/app/navigation";
import { routeKey } from "@/app/routeKey";
import { trace } from "@/shared/lib/analytics";
import { AuthProvider, useAuth } from "@/features/auth/context";
import { useIdleLock } from "@/features/auth/useIdleLock";
import { LockScreen } from "@/features/auth/components/LockScreen";
import { isLocked, subscribeLock } from "@/shared/lib/lockState";
import { WorkspaceProvider, useWorkspace } from "@/features/workspace/context";
import { DemoProvider } from "@/features/demo/context";
import { OrbitProvider } from "@/features/orbit/components/OrbitProvider";
import { NotesProvider, NotesPanel } from "@/features/notes";
import { ErrorBoundary } from "@/shared/ui/ErrorBoundary";
import { NotFound } from "@/shared/ui/NotFound";
import { AppBootSkeleton } from "@/shared/ui/Skeletons";
import { ShellLayout } from "@/app/shell/ShellLayout";
import { WelcomeOverlay, consumeWelcomePending } from "@/shared/ui/WelcomeOverlay";
import "@/app/App.css";
import "@/polish.css";
import "@/app/viewTransitions.css";
import "@/app/dropdown.css";
// Last, so the phone layout wins over the desktop rules it adjusts.
import "@/app/mobile.css";

// Auth screens load eagerly: they are the first thing a signed-out visitor
// sees, and a chunk fetch there would show a blank frame before the form.
import Login from "@/features/auth/pages/Login";
import ForgotPassword from "@/features/auth/pages/ForgotPassword";
import Signup from "@/features/auth/pages/Signup";
import Home from "@/features/analytics/pages/Home";

// Everything else is split out — most sessions touch only a few of these, and
// the admin, print and journey routes are dead weight for almost everyone.
const Orbit = lazy(() => import("@/features/orbit/pages/Orbit"));
const Analytics = lazy(() => import("@/features/analytics/pages/Analytics"));
const Seo = lazy(() => import("@/features/seo/pages/Seo"));
const SearchConsole = lazy(() => import("@/features/searchConsole/pages/SearchConsole"));
const SearchConsolePageDetail = lazy(() => import("@/features/searchConsole/pages/SearchConsolePageDetail"));
const Compare = lazy(() => import("@/features/compare/pages/Compare"));
const Backlinks = lazy(() => import("@/features/backlinks/pages/Backlinks"));
const SeoReportPrint = lazy(() => import("@/features/seo/pages/SeoReportPrint"));
const Workspaces = lazy(() => import("@/features/workspace/pages/Workspaces"));
const Developers = lazy(() => import("@/features/support/pages/Developers"));
const Members = lazy(() => import("@/features/workspace/pages/Members"));
const Branding = lazy(() => import("@/features/branding/pages/Branding"));
const MediaLibrary = lazy(() => import("@/features/media/pages/MediaLibrary"));
const AcceptInvite = lazy(() => import("@/features/workspace/pages/AcceptInvite"));
const Share = lazy(() => import("@/features/analytics/pages/Share"));
const Reports = lazy(() => import("@/features/reports/pages"));
const Journey = lazy(() => import("@/features/journey/pages/Journey"));
const JourneyTimeline = lazy(() => import("@/features/journey/pages/JourneyTimeline"));
const SocialPosts = lazy(() => import("@/features/social/pages/SocialPosts"));
const Reviews = lazy(() => import("@/features/reviews/pages/Reviews"));
const LeadCapture = lazy(() => import("@/features/leadCapture/pages/LeadCapture"));
const Impersonate = lazy(() => import("@/features/admin/pages/Impersonate"));
const DemoUsage = lazy(() => import("@/features/admin/pages/DemoUsage"));
const Settings = lazy(() => import("@/features/auth/pages/Settings"));
const DataDeletion = lazy(() => import("@/features/auth/pages/DataDeletion"));
const Billing = lazy(() => import("@/features/billing/pages/Billing"));
const ComparePlans = lazy(() => import("@/features/billing/pages/ComparePlans"));
const AdminBilling = lazy(() => import("@/features/admin/pages/AdminBilling"));
const AdminBroadcast = lazy(() => import("@/features/admin/pages/AdminBroadcast"));
const AdminDatabase = lazy(() => import("@/features/admin/pages/AdminDatabase"));
const Onboarding = lazy(() => import("@/features/auth/pages/Onboarding"));
const PublicDashboard = lazy(() => import("@/features/analytics/pages/PublicDashboard"));
const PublicSeoReport = lazy(() => import("@/features/seo/pages/PublicSeoReport"));
const Dashboards = lazy(() => import("@/features/dashboards/pages/Dashboards"));
const DashboardTemplates = lazy(() => import("@/features/dashboards/pages/DashboardTemplates"));
const DashboardView = lazy(() => import("@/features/dashboards/pages/DashboardView"));
const DashboardStudio = lazy(() => import("@/features/dashboards/pages/DashboardStudio"));
const Goals = lazy(() => import("@/features/goals/pages/Goals"));
const EmbedWidget = lazy(() => import("@/features/embed/pages/EmbedWidget"));

function RequireSetup({ children }: { children: ReactNode }) {
  const { workspaces, loading, fetchFailed } = useWorkspace();
  const { user } = useAuth();
  const [locked, setLocked] = useState(isLocked());

  const [showWelcome, setShowWelcome] = useState(consumeWelcomePending);

  useEffect(() => subscribeLock(setLocked), []);

  if (loading) return <AppBootSkeleton />;

  const setupExempt = user?.demo || user?.impersonating;

  if (fetchFailed || locked) return <>{children}</>;

  const skipped = localStorage.getItem("quantalog_onboarding_skipped") === "1";
  if (!workspaces.length && !skipped && !setupExempt) {
    return <Navigate to="/app/onboarding" replace />;
  }
  return (
    <>
      {showWelcome && (
        <WelcomeOverlay
          name={user?.firstName || undefined}
          onDone={() => setShowWelcome(false)}
        />
      )}
      {children}
    </>
  );
}

function Protected({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  useIdleLock(Boolean(user?.screenLockEnabled && !user?.demo));
  if (loading) return <AppBootSkeleton />;
  if (!user) return <Navigate to="/login" replace />;
  return (
    <WorkspaceProvider>
      <OrbitProvider>
        <NotesProvider>
          <RequireSetup>{children}</RequireSetup>
          <NotesPanel />
          <LockScreen />
        </NotesProvider>
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

 
function FocusOnRouteChange() {
  const pathname = routeKey(useLocation().pathname);
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

 
function RouteFrame({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  return (
    <ErrorBoundary variant="route" resetKey={pathname}>
      <Suspense fallback={null}>{children}</Suspense>
    </ErrorBoundary>
  );
}

 
function JourneyRouteTracer() {
  const location = useLocation();
  const { user } = useAuth();
  const prevPath = useRef<string | null>(null);
 
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

 
const SELF_TRACKING_ENABLED = false;

function SelfTracking() {
  useEffect(() => {
    if (!SELF_TRACKING_ENABLED) return;
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
              <Route path="/embed/:token" element={<RouteFrame><EmbedWidget /></RouteFrame>} />
              <Route path="/invite/:token" element={<RouteFrame><AcceptInvite /></RouteFrame>} />
              <Route path="/seo-report/:token" element={<RouteFrame><PublicSeoReport /></RouteFrame>} />
              <Route path="/data-deletion" element={<RouteFrame><DataDeletion /></RouteFrame>} />
              <Route path="/app/onboarding" element={<ProtectedRaw><RouteFrame><Onboarding /></RouteFrame></ProtectedRaw>} />
              <Route
                path="/app/seo/:siteId/report/:reportId/print"
                element={<ProtectedRaw><RouteFrame><SeoReportPrint /></RouteFrame></ProtectedRaw>}
              />
              <Route element={<Protected><ShellLayout /></Protected>}>
                <Route path="/app" element={<Home />} />
                <Route path="/app/analytics" element={<Analytics />} />
                <Route path="/app/dashboards" element={<Dashboards />} />
                <Route path="/app/dashboards/new" element={<DashboardTemplates />} />
                <Route path="/app/dashboards/studio" element={<DashboardStudio />} />
                <Route path="/app/dashboards/:id" element={<DashboardView />} />
                <Route path="/app/dashboards/:id/studio" element={<DashboardStudio />} />
                <Route path="/app/goals" element={<Goals />} />
                <Route path="/app/seo" element={<Seo />} />
                <Route path="/app/search-visibility" element={<SearchConsole />} />
                <Route path="/app/search-visibility/page/:pageKey" element={<SearchConsolePageDetail />} />
                <Route path="/app/search-console" element={<SearchConsole />} />
                <Route path="/app/search-console/page/:pageKey" element={<SearchConsolePageDetail />} />
                <Route path="/app/compare" element={<Compare />} />
                <Route path="/app/backlinks" element={<Backlinks />} />
                <Route path="/app/workspaces" element={<Workspaces />} />
                <Route path="/app/members" element={<Members />} />
                <Route path="/app/orbit" element={<Orbit />} />
                <Route path="/app/branding" element={<Branding />} />
                <Route path="/app/media" element={<MediaLibrary />} />
                <Route path="/app/share" element={<Share />} />
                <Route path="/app/reports" element={<Reports />} />
                <Route path="/app/journey" element={<Journey />} />
                <Route path="/app/journey/:appUserId" element={<JourneyTimeline />} />
                <Route path="/app/social" element={<SocialPosts />} />
                <Route path="/app/reviews" element={<Reviews />} />
                <Route path="/app/lead-capture" element={<LeadCapture />} />
                <Route path="/app/developers" element={<Developers />} />
                <Route path="/app/settings/:section?" element={<Settings />} />
                <Route path="/app/billing" element={<Billing />} />
                <Route path="/app/billing/plans" element={<ComparePlans />} />
                {/* Admin-only, enforced by the page and by every /api/admin route. */}
                <Route path="/app/impersonate" element={<Impersonate />} />
                <Route path="/app/demo-usage" element={<DemoUsage />} />
                <Route path="/app/admin/billing" element={<AdminBilling />} />
                <Route path="/app/admin/broadcast" element={<AdminBroadcast />} />
                <Route path="/app/admin/database" element={<AdminDatabase />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </DemoProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
