import { useState } from "react";
import {
  ActionIcon, Badge, Box, Button, Collapse, CopyButton, Divider, Menu, Text, Tooltip,
} from "@mantine/core";
import { Check, Copy, ExternalLink, MoreHorizontal, Radar, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { InstallCheck } from "@/features/workspace/components/InstallCheck";
import { SnippetBuilder } from "@/features/workspace/components/SnippetBuilder";
import { useSiteInstalled } from "@/features/workspace";
import { getFramework, type FrameworkId } from "@/features/workspace/frameworks";
import { SiteFavicon } from "@/shared/ui/SiteFavicon";
import { BrandIcon } from "@/shared/ui/BrandIcon";
import type { Site } from "@/shared/types";
import classes from "./Workspaces.module.css";

interface Props {
  site: Site;
  workspaceId: string;
  onDelete: (() => void) | null;
}

export function SiteRow({ site, workspaceId, onDelete }: Props) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const installed = useSiteInstalled(workspaceId, site.siteId);

  const guide = getFramework(site.framework);
  const snippet = guide.code(site.siteId, site.trackerOptions ?? {});
  const frameworkLabel = guide.id === "other" ? null : guide.label;

  return (
    <Box className={classes.site}>
      <Box className={classes.siteRow}>
        <span className={classes.siteFavicon}>
          <SiteFavicon domain={site.domain} framework={site.framework} size={20} />
        </span>

        <Box className={classes.siteText}>
          <Box className={classes.siteName}>
            <Text fw={600} size="sm" truncate>
              {site.name}
            </Text>
            {frameworkLabel && (
              <Badge
                size="xs"
                variant="default"
                radius="sm"
                tt="none"
                fw={500}
                leftSection={<BrandIcon framework={site.framework as FrameworkId} size={10} />}
              >
                {frameworkLabel}
              </Badge>
            )}
          </Box>
          <a
            className={classes.siteDomain}
            href={`https://${site.domain}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {site.domain}
            <ExternalLink size={11} />
          </a>
        </Box>

        {installed !== null && (
          <Tooltip label={installed ? t("workspaces.receivingData") : t("workspaces.waitingFirstView")} withArrow>
            <span className={classes.status} data-live={installed || undefined}>
              <span className={classes.statusDot} />
              {installed ? t("workspaces.statusLive", "Live") : t("workspaces.statusNoData", "No data yet")}
            </span>
          </Tooltip>
        )}

        <Box className={classes.siteActions}>
          <Tooltip label={t("workspaces.verifyTooltip")} withArrow>
            <Button
              size="xs"
              variant={open ? "light" : "default"}
              leftSection={<Radar size={13} />}
              onClick={() => setOpen((v) => !v)}
            >
              {t("workspaces.verify")}
            </Button>
          </Tooltip>
          <CopyButton value={snippet}>
            {({ copied, copy }) => (
              <Tooltip label={copied ? t("workspaces.copied") : t("workspaces.copySnippet")} withArrow>
                <Button
                  size="xs"
                  variant="default"
                  onClick={copy}
                  leftSection={copied ? <Check size={13} /> : <Copy size={13} />}
                >
                  {t("workspaces.snippet")}
                </Button>
              </Tooltip>
            )}
          </CopyButton>
          <Menu position="bottom-end" withinPortal shadow="md" width={190}>
            <Menu.Target>
              <ActionIcon variant="subtle" color="gray" aria-label={t("workspaces.siteActions", "Site actions")}>
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
