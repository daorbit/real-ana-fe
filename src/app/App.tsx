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
            <Route path="/share/:token" element={<PublicDashboard />} />
            <Route path="/invite/:token" element={<AcceptInvite />} />
            <Route path="/seo-report/:token" element={<PublicSeoReport />} />
            <Route path="/data-deletion" element={<DataDeletion />} />
            <Route path="/app/onboarding" element={<ProtectedRaw><Onboarding /></ProtectedRaw>} />
            <Route path="/app" element={<Protected><Home /></Protected>} />
            <Route path="/app/analytics" element={<Protected><Analytics /></Protected>} />
            <Route path="/app/seo" element={<Protected><Seo /></Protected>} />
            <Route path="/app/compare" element={<Protected><Compare /></Protected>} />
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
