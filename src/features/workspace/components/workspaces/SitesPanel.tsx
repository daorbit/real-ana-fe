import { useState } from "react";
import { ActionIcon, Box, TextInput, UnstyledButton } from "@mantine/core";
import { Globe, Plus, Search, SearchX, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { RefreshButton } from "@/shared/ui/Refresh";
import { EmptyState } from "@/shared/ui/EmptyState";
import type { Site } from "@/shared/types";
import { SiteCard } from "./SiteCard";
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
}: Props) {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");

  const q = query.trim().toLowerCase();
  const shown = q
    ? sites.filter((s) => s.name.toLowerCase().includes(q) || s.domain.toLowerCase().includes(q))
    : sites;

  return (
    <Box component="section" className={classes.sites}>
      <Box className={classes.sitesHead}>
        <div>
          <h3 className={classes.sitesTitle}>
            {t("workspaces.sites")}
            <span className={classes.countBadge}>
              {q ? t("workspaces.shownOf", { shown: shown.length, total: sites.length }) : sites.length}
            </span>
          </h3>
          <div className={classes.sitesSub}>
            {t("workspaces.sitesSub", "The domains this workspace tracks, and whether each one is sending data.")}
          </div>
        </div>
        <Box className={classes.sitesTools}>
          {sites.length >= 3 && (
            <TextInput
              className={classes.filter}
              placeholder={t("workspaces.filterPlaceholder")}
              value={query}
              onChange={(e) => setQuery(e.currentTarget.value)}
              leftSection={<Search size={14} />}
              rightSection={
                query ? (
                  <ActionIcon
                    variant="subtle"
                    color="gray"
                    size="sm"
                    onClick={() => setQuery("")}
                    aria-label={t("workspaces.clearFilter")}
                  >
                    <X size={13} />
                  </ActionIcon>
                ) : null
              }
              aria-label={t("workspaces.filterAria")}
            />
          )}
          <RefreshButton onRefresh={onRefresh} refreshing={refreshing} lastUpdated={lastUpdated} compact />
        </Box>
      </Box>

      {sites.length === 0 ? (
        <Box className={classes.empty}>
          <EmptyState
            compact
            icon={Globe}
            title={t("workspaces.noSitesTitle")}
            description={t("workspaces.noSitesBody")}
            action={canEdit ? { label: t("workspaces.noSitesCta"), icon: Plus, onClick: onAddSite } : undefined}
          />
        </Box>
      ) : shown.length === 0 ? (
        <Box className={classes.empty}>
          <EmptyState
            compact
            icon={SearchX}
            title={t("workspaces.noMatch", { query })}
            action={{ label: t("workspaces.clearFilter"), onClick: () => setQuery("") }}
          />
        </Box>
      ) : (
        <div className={classes.siteGrid}>
          {shown.map((s) => (
            <SiteCard
              key={s._id}
              site={s}
              workspaceId={workspaceId}
              onDelete={canEdit ? () => onDeleteSite(s) : null}
            />
          ))}
          {canEdit && !q && (
            <UnstyledButton className={classes.addTile} onClick={onAddSite}>
              <span className={classes.addTileIcon}>
                <Plus size={18} />
              </span>
              <span className={classes.addTileTitle}>{t("workspaces.addAnother")}</span>
              <span className={classes.addTileSub}>
                {t("workspaces.addTileSub", "Websites or mobile apps — we'll hand you the snippet.")}
              </span>
            </UnstyledButton>
          )}
        </div>
      )}
    </Box>
  );
}
