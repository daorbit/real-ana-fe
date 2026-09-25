import { useState } from "react";
import {
  ActionIcon, Box, Button, Collapse, CopyButton, Divider, Menu, Tooltip,
} from "@mantine/core";
import { Activity, Check, ChevronDown, Code2, Copy, ExternalLink, MoreHorizontal, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { InstallCheck } from "@/features/workspace/components/InstallCheck";
import { SnippetBuilder } from "@/features/workspace/components/SnippetBuilder";
import { useSiteStatus } from "@/features/workspace";
import { getFramework, type FrameworkId } from "@/features/workspace/frameworks";
import { compact, timeAgo } from "@/shared/lib/format";
import { SiteFavicon } from "@/shared/ui/SiteFavicon";
import { BrandIcon } from "@/shared/ui/BrandIcon";
import type { Site } from "@/shared/types";
import classes from "./Workspaces.module.css";

interface Props {
  site: Site;
  workspaceId: string;
  onDelete: (() => void) | null;
}

/**
 * One tracked site as a card. Opening "Install & verify" widens it to the full
 * row, so the snippet builder has room to breathe.
 */
export function SiteCard({ site, workspaceId, onDelete }: Props) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const status = useSiteStatus(workspaceId, site.siteId);
  const installed = status ? status.installed : null;

  const guide = getFramework(site.framework);
  const snippet = guide.code(site.siteId, site.trackerOptions ?? {});
  const frameworkLabel = guide.id === "other" ? null : guide.label;

  return (
    <Box className={classes.siteCard} data-open={open || undefined} data-live={installed || undefined}>
      <Box className={classes.siteTop}>
        <span className={classes.siteFavicon}>
          <SiteFavicon domain={site.domain} framework={site.framework} size={24} />
        </span>

        <Box className={classes.siteText}>
          <div className={classes.siteName}>{site.name}</div>
          <a className={classes.siteDomain} href={`https://${site.domain}`} target="_blank" rel="noopener noreferrer">
            {site.domain}
            <ExternalLink size={11} />
          </a>
        </Box>

        <Menu position="bottom-end" withinPortal shadow="md" width={190}>
          <Menu.Target>
            <ActionIcon variant="subtle" color="gray" size={30} aria-label={t("workspaces.siteActions", "Site actions")}>
              <MoreHorizontal size={16} />
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
              {t("workspaces.openSite", "Open site")}
            </Menu.Item>
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

      <Box className={classes.siteInfo}>
        {installed !== null && (
          <Tooltip label={installed ? t("workspaces.receivingData") : t("workspaces.waitingFirstView")} withArrow>
            <span className={classes.status} data-live={installed || undefined}>
              <span className={classes.statusDot} />
              {installed ? t("workspaces.statusLive", "Live") : t("workspaces.statusWaiting", "Waiting for data")}
            </span>
          </Tooltip>
        )}
        {frameworkLabel && (
          <span className={classes.siteTag}>
            <BrandIcon framework={site.framework as FrameworkId} size={11} />
            {frameworkLabel}
          </span>
        )}
        {status?.installed && (
          <span className={classes.siteActivity}>
            <Activity size={12} />
            {t("workspaces.eventsSeen", { count: compact(status.eventCount), defaultValue: "{{count}} events" })}
            {status.lastEventAt && <> · {timeAgo(status.lastEventAt)}</>}
          </span>
        )}
      </Box>

      <Box className={classes.siteFoot}>
        <Button
          size="xs"
          variant={installed === false ? "light" : "default"}
          className={classes.verifyBtn}
          data-open={open || undefined}
          rightSection={<ChevronDown size={13} className={classes.chev} />}
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
        >
          {t("workspaces.installVerify", "Install & verify")}
        </Button>
        <CopyButton value={snippet}>
          {({ copied, copy }) => (
            <Tooltip label={copied ? t("workspaces.copied") : t("workspaces.copySnippet")} withArrow>
              <Button
                size="xs"
                variant="subtle"
                color="gray"
                leftSection={copied ? <Check size={13} /> : <Code2 size={13} />}
                onClick={copy}
              >
                {copied ? t("workspaces.copied") : t("workspaces.snippet")}
              </Button>
            </Tooltip>
          )}
        </CopyButton>
      </Box>

      <Collapse expanded={open}>
        <Box className={classes.siteDetails}>
          <InstallCheck workspaceId={workspaceId} siteId={site.siteId} domain={site.domain} />
          <Divider my="lg" label={t("workspaces.installSnippet")} labelPosition="center" />
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
