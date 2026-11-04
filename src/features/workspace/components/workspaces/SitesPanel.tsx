import { useState } from "react";
import { Box } from "@mantine/core";
import { Globe, Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { EmptyState } from "@/shared/ui/EmptyState";
import type { Site } from "@/shared/types";
import { SiteCard } from "./SiteCard";
import { EditSiteModal } from "./EditSiteModal";
import classes from "./Workspaces.module.css";

interface Props {
  sites: Site[];
  workspaceId: string;
  canEdit: boolean;
  onAddSite: () => void;
  onDeleteSite: (site: Site) => void;
  onRefresh: () => void;
  refreshing: boolean;
  lastUpdated: Date | null;
  focusedSiteId?: string | null;
}

export function SitesPanel({
  sites,
  workspaceId,
  canEdit,
  onAddSite,
  onDeleteSite,
  onRefresh,
  refreshing,
  lastUpdated,
  focusedSiteId,
}: Props) {
  const { t } = useTranslation();
  const [editing, setEditing] = useState<Site | null>(null);

  return (
    <Box component="section" className={classes.sites} aria-label={t("workspaces.websiteLabel")}>
      {sites.length === 0 ? (
        <Box className={`${classes.card} ${classes.empty}`}>
          <EmptyState
            compact
            icon={Globe}
            title={t("workspaces.noSitesTitle")}
            description={t("workspaces.noSitesBody")}
            action={canEdit ? { label: t("workspaces.noSitesCta"), icon: Plus, onClick: onAddSite } : undefined}
          />
        </Box>
      ) : (
        sites.map((s) => (
          <SiteCard
            key={s._id}
            site={s}
            workspaceId={workspaceId}
            onEdit={canEdit ? () => setEditing(s) : null}
            onDelete={canEdit ? () => onDeleteSite(s) : null}
            onRefresh={onRefresh}
            refreshing={refreshing}
            lastUpdated={lastUpdated}
            focused={s.siteId === focusedSiteId}
          />
        ))
      )}

      <EditSiteModal site={editing} sites={sites} workspaceId={workspaceId} onClose={() => setEditing(null)} />
    </Box>
  );
}
