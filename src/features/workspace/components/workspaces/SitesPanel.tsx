import { useState } from "react";
import { ActionIcon, Badge, Box, Button, Text, TextInput } from "@mantine/core";
import { Globe, Plus, Search, SearchX, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { RefreshButton } from "@/shared/ui/Refresh";
import { EmptyState } from "@/shared/ui/EmptyState";
import type { Site } from "@/shared/types";
import { SiteRow } from "./SiteRow";
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
    <Box component="section" className={classes.card}>
      <Box className={classes.sitesHead}>
        <Box className={classes.sitesTitle}>
          <Text fw={650} size="sm">
            {t("workspaces.sites")}
          </Text>
          <Badge variant="default" size="sm" radius="sm">
            {q ? t("workspaces.shownOf", { shown: shown.length, total: sites.length }) : sites.length}
          </Badge>
        </Box>
        <Box className={classes.sitesTools}>
          {sites.length >= 3 && (
            <TextInput
              size="xs"
              w={220}
              placeholder={t("workspaces.filterPlaceholder")}
              value={query}
              onChange={(e) => setQuery(e.currentTarget.value)}
              leftSection={<Search size={13} />}
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
        <>
          {shown.map((s) => (
            <SiteRow
              key={s._id}
              site={s}
              workspaceId={workspaceId}
              onDelete={canEdit ? () => onDeleteSite(s) : null}
            />
          ))}
          {canEdit && (
            <Box className={classes.footer}>
              <Button variant="subtle" color="gray" size="sm" leftSection={<Plus size={15} />} onClick={onAddSite}>
                {t("workspaces.addAnother")}
              </Button>
            </Box>
          )}
        </>
      )}
    </Box>
  );
}
