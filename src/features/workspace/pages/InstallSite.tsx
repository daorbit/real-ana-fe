import { useCallback } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Center, Loader } from "@mantine/core";
import { ChevronLeft, FolderKanban, Globe, Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { AppShell } from "@/app/AppShell";
import { useWorkspace } from "@/features/workspace/context";
import { useSites } from "@/features/workspace/useSites";
import { useSiteStatus } from "@/features/workspace/useInstallStatus";
import { useDemo } from "@/features/demo/context";
import { ADD_SITE_PATH, WORKSPACES_PATH, siteInstallPath } from "@/features/workspace/paths";
import { isSiteVerified } from "@/features/workspace/setupState";
import { InstallSitePicker } from "@/features/workspace/components/install/InstallSitePicker";
import { InstallSteps } from "@/features/workspace/components/install/InstallSteps";
import { InstallSiteSummary } from "@/features/workspace/components/install/InstallSiteSummary";
import classes from "@/features/workspace/components/install/Install.module.css";
import { EmptyState } from "@/shared/ui/EmptyState";
import { PageHeader } from "@/shared/ui/Page";
import { SiteFavicon } from "@/shared/ui/SiteFavicon";
import { DOCS_SLUGS } from "@/shared/lib/docsSlugs";
import { useTitle } from "@/shared/lib/useTitle";
import type { Site } from "@/shared/types";

function InstallView({ site, sites, workspaceId, onInstalled, onPick }: {
  site: Site;
  sites: Site[];
  workspaceId: string;
  onInstalled: () => void;
  onPick: (siteId: string) => void;
}) {
  const { t } = useTranslation();
  const status = useSiteStatus(workspaceId, site.siteId);
  const live = status ? status.installed : isSiteVerified(site);
  const name = site.domain || site.name;

  return (
    <>
      <Link to={WORKSPACES_PATH} className={classes.back}>
        <ChevronLeft size={15} />
        {t("install.allSites", "All sites")}
      </Link>

      <PageHeader
        title={
          <span className={classes.titleRow}>
            <span className={classes.titleFavicon}>
              <SiteFavicon domain={site.domain} framework={site.framework} logoUrl={site.logoUrl} size={22} />
            </span>
            {t("install.pageTitleFor", { defaultValue: "Install on {{site}}", site: name })}
          </span>
        }
        description={t(
          "install.pageBody",
          "Three steps: copy the snippet, add it to your site, and confirm Quantalog is receiving visits.",
        )}
        docsPath={DOCS_SLUGS.tracking}
      />

      {sites.length > 1 && <InstallSitePicker sites={sites} selectedId={site.siteId} onPick={onPick} />}

      <div className={classes.layout}>
        <InstallSteps key={site.siteId} site={site} workspaceId={workspaceId} live={live} onInstalled={onInstalled} />
        <InstallSiteSummary site={site} status={status} live={live} />
      </div>
    </>
  );
}

export default function InstallSite() {
  const { t } = useTranslation();
  useTitle(t("install.pageTitle", "Install & verify"));
  const nav = useNavigate();
  const { siteId } = useParams<{ siteId?: string }>();
  const { active, loading } = useWorkspace();
  const { demo } = useDemo();
  const { sites, refresh, lastUpdated } = useSites(active?._id);
  const loaded = demo || Boolean(lastUpdated);

  const onInstalled = useCallback(() => void refresh(), [refresh]);
  const pick = useCallback((id: string) => nav(siteInstallPath(id), { replace: true }), [nav]);

  if (loading || (active && !loaded)) {
    return (
      <AppShell>
        <Center mih="50vh">
          <Loader size="sm" />
        </Center>
      </AppShell>
    );
  }

  if (!active) {
    return (
      <AppShell>
        <EmptyState
          icon={FolderKanban}
          title={t("install.noWorkspace", "No workspace yet")}
          description={t("install.noWorkspaceBody", "Create a workspace first, then add the site you want to track.")}
          action={{ label: t("install.createWorkspace", "Create a workspace"), to: WORKSPACES_PATH, icon: Plus }}
        />
      </AppShell>
    );
  }

  if (sites.length === 0) {
    return (
      <AppShell>
        <EmptyState
          icon={Globe}
          title={t("install.noSiteTitle", "Add a site to install")}
          description={t("install.noSiteBody", "Tell us the domain you want to track and we'll build the snippet for it.")}
          action={{ label: t("setup.addSite", "Add a site"), to: ADD_SITE_PATH, icon: Plus }}
        />
      </AppShell>
    );
  }

  const site = sites.find((s) => s.siteId === siteId) ?? sites.find((s) => !isSiteVerified(s)) ?? sites[0];

  return (
    <AppShell>
      <InstallView site={site} sites={sites} workspaceId={active._id} onInstalled={onInstalled} onPick={pick} />
    </AppShell>
  );
}
