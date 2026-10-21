import { Tabs } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import { AppShell } from "@/app/AppShell";
import { useGetShareQuery } from "@/app/store";
import { PageHeader } from "@/shared/ui/Page";
import { DOCS_SLUGS } from "@/shared/lib/docsSlugs";
import { PageHelpButton } from "@/shared/ui/PageHelpButton";
import { useTitle } from "@/shared/lib/useTitle";
import { SaveBarProvider } from "@/shared/ui/SaveBar";
import { RoleGate } from "@/features/billing/components/RoleGate";
import { useWorkspace } from "@/features/workspace/context";
import { useWorkspaceApps } from "@/features/workspace/useWorkspaceApps";
import { QuantalogAppGate } from "@/features/integrations/components/quantalogApps/QuantalogAppGate";
import { AnalyticsShareTab } from "@/features/analytics/components/share/analytics/AnalyticsShareTab";
import { SeoShareTab } from "@/features/analytics/components/share/seo/SeoShareTab";
import { NoWorkspace } from "@/features/analytics/components/share/NoWorkspace";
import classes from "@/features/analytics/components/share/Share.module.css";

export default function Share() {
  useTitle("Public sharing");
  const { t } = useTranslation();
  const { active } = useWorkspace();
  const apps = useWorkspaceApps();
  const [params, setParams] = useSearchParams();
  const tab = params.get("tab") === "seo" ? "seo" : "analytics";
  const { data: share } = useGetShareQuery(active?._id ?? "", { skip: !active || !apps.publicDashboard });

  const setTab = (next: string | null) =>
    setParams(
      (prev) => {
        const out = new URLSearchParams(prev);
        if (next === "seo") out.set("tab", "seo");
        else out.delete("tab");
        return out;
      },
      { replace: true },
    );

  return (
    <AppShell>
      <PageHeader
        title={t("share.pageTitle")}
        description={t("share.pageDescription")}
        docsPath={tab === "seo" ? DOCS_SLUGS.quantalogSeoReports : DOCS_SLUGS.publicDashboards}
        actions={<PageHelpButton />}
      />
      {active ? (
        <RoleGate minimum="admin" what="Only admins can manage public sharing.">
          <Tabs
            key={active._id}
            value={tab}
            onChange={setTab}
            keepMounted={false}
            classNames={{ list: classes.tabList, tab: classes.tab }}
          >
            <Tabs.List>
              <Tabs.Tab value="analytics">
                {t("share.tabAnalyticsLong")}
                {share?.enabled && <span className={classes.tabDot} aria-label={t("share.live")} />}
              </Tabs.Tab>
              <Tabs.Tab value="seo">{t("share.tabSeoLong")}</Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="analytics">
              {apps.publicDashboard ? (
                <SaveBarProvider>
                  <AnalyticsShareTab workspaceId={active._id} />
                </SaveBarProvider>
              ) : (
                <QuantalogAppGate app="publicDashboard" />
              )}
            </Tabs.Panel>
            <Tabs.Panel value="seo">
              {apps.seoReports ? (
                <SaveBarProvider>
                  <SeoShareTab workspaceId={active._id} />
                </SaveBarProvider>
              ) : (
                <QuantalogAppGate app="seoReports" />
              )}
            </Tabs.Panel>
          </Tabs>
        </RoleGate>
      ) : (
        <NoWorkspace />
      )}
    </AppShell>
  );
}
