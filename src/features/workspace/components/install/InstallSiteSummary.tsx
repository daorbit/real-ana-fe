import type { ReactNode } from "react";
import { ActionIcon, CopyButton, Tooltip } from "@mantine/core";
import { BookOpen, Check, ChevronRight, Copy, Send } from "lucide-react";
import { useTranslation } from "react-i18next";
import { getFramework } from "@/features/workspace/frameworks";
import { developerEmailHref } from "@/features/workspace/developerEmail";
import { useSiteStatus } from "@/features/workspace/useInstallStatus";
import { compact, timeAgo } from "@/shared/lib/format";
import { DOCS_SLUGS, docsUrl } from "@/shared/lib/docsSlugs";
import type { Site } from "@/shared/types";
import { InstallStatusPill } from "./InstallStatusPill";
import classes from "./Install.module.css";

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className={classes.row}>
      <span className={classes.rowLabel}>{label}</span>
      <span className={classes.rowValue}>{children}</span>
    </div>
  );
}

function LinkRow({ icon, label, href }: { icon: ReactNode; label: string; href: string }) {
  return (
    <a className={classes.linkRow} href={href} target={href.startsWith("mailto:") ? undefined : "_blank"} rel="noopener noreferrer">
      <span className={classes.linkIcon}>{icon}</span>
      <span className={classes.linkLabel}>{label}</span>
      <ChevronRight size={15} className={classes.linkChevron} />
    </a>
  );
}

export function InstallSiteSummary({
  site,
  status,
  live,
}: {
  site: Site;
  status: ReturnType<typeof useSiteStatus>;
  live: boolean;
}) {
  const { t } = useTranslation();
  const guide = getFramework(site.framework);
  const snippet = guide.code(site.siteId, site.trackerOptions ?? {});

  return (
    <aside className={classes.aside}>
      <p className={classes.groupLabel}>{t("install.details", "Details")}</p>
      <div className={classes.group}>
        <Row label={t("install.status", "Status")}>
          <InstallStatusPill live={live} />
        </Row>
        <Row label={t("install.framework", "Framework")}>{guide.label}</Row>
        {status?.installed && <Row label={t("install.events", "Events so far")}>{compact(status.eventCount)}</Row>}
        {status?.lastEventAt && <Row label={t("install.lastEvent", "Last event")}>{timeAgo(status.lastEventAt)}</Row>}
        <Row label={t("install.siteId", "Site ID")}>
          <code className={classes.siteId}>{site.siteId}</code>
          <CopyButton value={site.siteId}>
            {({ copied, copy }) => (
              <Tooltip label={copied ? t("workspaces.copied", "Copied") : t("workspaces.copySiteId", "Copy site ID")} withArrow>
                <ActionIcon size="sm" variant="subtle" color="gray" onClick={copy} aria-label={t("workspaces.copySiteId", "Copy site ID")}>
                  {copied ? <Check size={13} /> : <Copy size={13} />}
                </ActionIcon>
              </Tooltip>
            )}
          </CopyButton>
        </Row>
      </div>

      <p className={classes.groupLabel}>{t("install.help", "Need a hand?")}</p>
      <div className={classes.group}>
        <LinkRow
          icon={<BookOpen size={15} />}
          label={t("install.guide", "Read the install guide")}
          href={docsUrl(site.platform === "app" ? DOCS_SLUGS.mobileTracking : DOCS_SLUGS.tracking)}
        />
        {site.platform !== "app" && site.domain && (
          <LinkRow
            icon={<Send size={15} />}
            label={t("install.emailDeveloper", "Email the snippet to my developer")}
            href={developerEmailHref({ domain: site.domain, guide, snippet })}
          />
        )}
      </div>
    </aside>
  );
}
