import { lazy, Suspense, type ComponentType, type LazyExoticComponent } from "react";
import { Navigate, useLocation, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AppShell } from "@/app/AppShell";
import { PageTabs } from "@/shared/ui/PageTabs";
import { pageTabId, pageTabPanelId } from "@/shared/ui/pageTabIds";
import { ListSkeleton } from "@/shared/ui/Skeletons";
import { ADMIN_TABS, adminToolPath, isAdminTab, type AdminTabId } from "../lib/adminTabs";

const TABS_ID = "admin-tools";

const PANELS: Record<AdminTabId, LazyExoticComponent<ComponentType>> = {
  email: lazy(() => import("@/features/admin/pages/AdminBroadcast")),
  impersonate: lazy(() => import("@/features/admin/pages/Impersonate")),
  "demo-usage": lazy(() => import("@/features/admin/pages/DemoUsage")),
  plans: lazy(() => import("@/features/admin/pages/AdminBilling")),
  referrals: lazy(() => import("@/features/referralAdmin/pages/AdminReferrals")),
  database: lazy(() => import("@/features/admin/pages/AdminDatabase")),
};

export default function AdminTools() {
  const { t } = useTranslation();
  const { tab } = useParams<{ tab?: string }>();
  const { search } = useLocation();
  const navigate = useNavigate();

  if (!isAdminTab(tab)) return <Navigate to={`${adminToolPath()}${search}`} replace />;

  const Panel = PANELS[tab];

  return (
    <AppShell>
      <PageTabs
        items={ADMIN_TABS.map((item) => ({ id: item.id, label: t(item.labelKey, item.label), icon: item.icon }))}
        active={tab}
        onChange={(next) => navigate(adminToolPath(next), { replace: true })}
        label={t("nav.adminTools", "Admin tools")}
        idPrefix={TABS_ID}
      />
      <div role="tabpanel" id={pageTabPanelId(TABS_ID, tab)} aria-labelledby={pageTabId(TABS_ID, tab)}>
        <Suspense fallback={<ListSkeleton rows={6} />}>
          <Panel />
        </Suspense>
      </div>
    </AppShell>
  );
}
