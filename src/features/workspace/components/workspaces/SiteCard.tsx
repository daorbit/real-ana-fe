import { useEffect, useRef, useState } from "react";
import {
  ActionIcon, Box, Button, Collapse, CopyButton, Divider, Group, Menu, Tooltip,
} from "@mantine/core";
import { SendToDeveloperButton } from "@/features/workspace/components/SendToDeveloperButton";
import { Check, ChevronDown, Code2, Copy, ExternalLink, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { InstallCheck } from "@/features/workspace/components/InstallCheck";
import { SnippetBuilder } from "@/features/workspace/components/SnippetBuilder";
import { useSiteStatus } from "@/features/workspace";
import { getFramework, type FrameworkId } from "@/features/workspace/frameworks";
import { compact, timeAgo } from "@/shared/lib/format";
import { BrandIcon } from "@/shared/ui/BrandIcon";
import { RefreshButton } from "@/shared/ui/Refresh";
import { SiteFavicon } from "@/shared/ui/SiteFavicon";
import type { Site } from "@/shared/types";
import { SiteStatusStat } from "./SiteStatusStat";
import { Stat } from "./Stat";
import { TrackerStatus } from "./TrackerStatus";
import classes from "./Workspaces.module.css";

interface Props {
  site: Site;
  workspaceId: string;
  onEdit: (() => void) | null;
  onDelete: (() => void) | null;
  onRefresh: () => void;
  refreshing: boolean;
  lastUpdated: Date | null;
  focused?: boolean;
}

export function SiteCard({
  site,
  workspaceId,
  onEdit,
  onDelete,
  onRefresh,
  refreshing,
  lastUpdated,
  focused = false,
}: Props) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(focused);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!focused) return;
    setOpen(true);
    const frame = requestAnimationFrame(() =>
      cardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
    );
    return () => cancelAnimationFrame(frame);
  }, [focused]);

  const status = useSiteStatus(workspaceId, site.siteId);
  const installed = status ? status.installed : null;

  const guide = getFramework(site.framework);
  const snippet = guide.code(site.siteId, site.trackerOptions ?? {});
  const frameworkLabel = guide.id === "other" ? null : guide.label;

  return (
    <Box ref={cardRef} className={classes.card}>
      <Box className={classes.siteTop}>
        <span className={classes.siteFavicon}>
          <SiteFavicon domain={site.domain} framework={site.framework} logoUrl={site.logoUrl} size={30} />
        </span>

        <Box className={classes.siteText}>
          <div className={classes.siteName}>{site.name}</div>
          <div className={classes.siteMeta}>
            <a className={classes.siteDomain} href={`https://${site.domain}`} target="_blank" rel="noopener noreferrer">
              {site.domain}
              <ExternalLink size={12} />
            </a>
            {frameworkLabel && (
              <span className={classes.siteFramework}>
                <BrandIcon framework={site.framework as FrameworkId} size={12} />
                {frameworkLabel}
              </span>
            )}
          </div>
        </Box>

        <Box className={classes.actions}>
          <Button
            variant="default"
            radius="xl"
            className={classes.verifyBtn}
            data-open={open || undefined}
            rightSection={<ChevronDown size={14} className={classes.chev} />}
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
          >
            {t("workspaces.installVerify", "Install & verify")}
          </Button>
          <CopyButton value={snippet}>
            {({ copied, copy }) => (
              <Tooltip label={copied ? t("workspaces.copied") : t("workspaces.copySnippet")} withArrow>
                <Button
                  variant="default"
                  radius="xl"
                  leftSection={copied ? <Check size={14} /> : <Code2 size={14} />}
                  onClick={copy}
                >
                  {copied ? t("workspaces.copied") : t("workspaces.snippet")}
                </Button>
              </Tooltip>
            )}
          </CopyButton>
          <RefreshButton onRefresh={onRefresh} refreshing={refreshing} lastUpdated={lastUpdated} />
          <Menu position="bottom-end" withinPortal shadow="md" width={200}>
            <Menu.Target>
              <ActionIcon variant="default" radius="xl" size={36} aria-label={t("workspaces.siteActions", "Website actions")}>
                <MoreHorizontal size={17} />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item
                leftSection={<ExternalLink size={14} />}
                component="a"
                href={`https://${site.domain}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {t("workspaces.openSite", "Open website")}
              </Menu.Item>
              {onEdit && (
                <Menu.Item leftSection={<Pencil size={14} />} onClick={onEdit}>
                  {t("workspaces.editSite", "Edit name & domain")}
                </Menu.Item>
              )}
              <Menu.Item leftSection={<Copy size={14} />} onClick={() => void navigator.clipboard.writeText(site.siteId)}>
                {t("workspaces.copySiteId", "Copy site ID")}
              </Menu.Item>
              {onDelete && (
                <>
                  <Menu.Divider />
                  <Menu.Item className="danger-item" color="red" leftSection={<Trash2 size={14} />} onClick={onDelete}>
                    {t("workspaces.deleteSite")}
                  </Menu.Item>
                </>
              )}
            </Menu.Dropdown>
          </Menu>
        </Box>
      </Box>

      <Box className={classes.stats} data-size="facts">
        <SiteStatusStat installed={installed} />
        <Stat label={t("workspaces.statEvents")} value={status ? compact(status.eventCount) : "—"} />
        <Stat
          label={t("workspaces.statLastEvent")}
          value={status?.lastEventAt ? timeAgo(status.lastEventAt) : t("workspaces.noEventsYet")}
        />
        <TrackerStatus workspaceId={workspaceId} siteId={site.siteId} />
      </Box>

      <Collapse expanded={open}>
        <Box className={classes.siteDetails}>
          <InstallCheck workspaceId={workspaceId} siteId={site.siteId} domain={site.domain} />
          <Divider my="lg" label={t("workspaces.installSnippet")} labelPosition="center" />
          {site.platform !== "app" && site.domain && (
            <Group justify="flex-end" mb="sm">
              <SendToDeveloperButton domain={site.domain} guide={guide} snippet={snippet} />
            </Group>
          )}
          <SnippetBuilder
            siteId={site.siteId}
            workspaceId={workspaceId}
            options={site.trackerOptions}
            framework={site.framework}
          />
        </Box>
      </Collapse>
    </Box>
  );
}
