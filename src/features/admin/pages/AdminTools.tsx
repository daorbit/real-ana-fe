import { lazy, Suspense, useEffect, type ComponentType } from "react";
import { Navigate, useLocation, useNavigate, useParams } from "react-router-dom";
import { AppShell } from "@/app/AppShell";
import { PageHeader } from "@/shared/ui/Page";
import { useTitle } from "@/shared/lib/useTitle";
import { onIdle } from "@/shared/lib/idle";
import { useIsPlatformAdmin } from "@/features/auth/context";
import { SuperAdminOnly } from "@/features/referralAdmin/components/SuperAdminOnly";
import { AdminNav } from "../components/layout/AdminNav";
import { adminSectionMeta, adminSectionPath, resolveAdminSection, type AdminSectionId } from "../lib/adminSections";
import classes from "../components/layout/AdminLayout.module.css";

type PanelModule = Promise<{ default: ComponentType }>;

const IMPORTERS: Record<AdminSectionId, () => PanelModule> = {
  users: () => import("../components/panels/UsersPanel"),
  email: () => import("../components/panels/EmailPanel"),
  plans: () => import("../components/panels/PlansPanel"),
  addons: () => import("../components/panels/AddonsPanel"),
  coupons: () => import("../components/panels/CouponsPanel"),
  referrals: () => import("../components/panels/ReferralsPanel"),
  demo: () => import("../components/panels/DemoPanel"),
  database: () => import("../components/panels/DatabasePanel"),
  alerts: () => import("../components/panels/AlertsPanel"),
};

const PANELS = Object.fromEntries(
  Object.entries(IMPORTERS).map(([id, load]) => [id, lazy(load)]),
) as unknown as Record<AdminSectionId, ComponentType>;

function usePreloadPanels(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;
    return onIdle(() => {
      Object.values(IMPORTERS).forEach((load) => void load().catch(() => undefined));
    });
  }, [enabled]);
}

export default function AdminTools() {
  const { section: raw } = useParams<{ section?: string }>();
  const { search } = useLocation();
  const navigate = useNavigate();
  const isAdmin = useIsPlatformAdmin();
  const section = resolveAdminSection(raw);
  useTitle(section ? `${adminSectionMeta(section).label} · Admin` : "Admin");
  usePreloadPanels(isAdmin);

  if (!isAdmin) {
    return (
      <AppShell>
        <SuperAdminOnly />
      </AppShell>
    );
  }

  if (!section || section !== raw) return <Navigate to={`${adminSectionPath(section ?? undefined)}${search}`} replace />;

  const Panel = PANELS[section];

  return (
    <AppShell>
      <PageHeader title="Admin" description="Run the platform: the people on it, what they pay, and how the system is holding up." />
      <div className={classes.layout}>
        <AdminNav active={section} onSelect={(next) => navigate(adminSectionPath(next), { replace: true })} />
        <div className={classes.content}>
          <Suspense fallback={null}>
            <Panel />
          </Suspense>
        </div>
      </div>
    </AppShell>
  );
}
