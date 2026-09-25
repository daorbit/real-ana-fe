import type { ReactNode } from "react";
import { ActionIcon, Anchor, CopyButton, Switch, Tooltip } from "@mantine/core";
import { Check, Copy, ExternalLink, Eye } from "lucide-react";
import { useTranslation } from "react-i18next";
import { num, timeAgo } from "@/shared/lib";
import classes from "./Share.module.css";

interface Props {
  title: string;
  description: string;
  enabled: boolean;
  busy: boolean;
  onToggle: (next: boolean) => void;
  url: string;
  views: number;
  lastViewedAt?: string | null;
  onReplace: () => void;
  /** Primary action next to the link, e.g. the Share composer button. */
  primaryAction?: ReactNode;
  /** Shown while the link is off, under the header. */
  offContent?: ReactNode;
}

/**
 * One public link: its status, the on/off switch, the URL with copy/open, and
 * how often it has been opened — everything about the link in one card.
 */
export function ShareLinkCard({
  title, description, enabled, busy, onToggle, url, views, lastViewedAt, onReplace,
  primaryAction, offContent,
}: Props) {
  const { t } = useTranslation();

  return (
    <div className={classes.card}>
      <div className={classes.linkHead}>
        <div className={classes.linkIntro}>
          <div className={classes.linkTitle}>
            {title}
            <span className={classes.status} data-live={enabled || undefined}>
              <span className={classes.statusDot} />
              {enabled ? t("share.live") : t("share.off")}
            </span>
          </div>
          <div className={classes.linkDesc}>{description}</div>
        </div>
        <Switch
          checked={enabled}
          onChange={(e) => onToggle(e.currentTarget.checked)}
          disabled={busy}
          size="md"
          aria-label={t("share.enableAria")}
        />
      </div>

      {enabled && url ? (
        <div className={classes.linkBody}>
          <div className={classes.linkRow}>
            <div className={classes.urlBox}>
              <code className={classes.url} title={url}>
                {url}
              </code>
              <CopyButton value={url} timeout={1600}>
                {({ copied, copy }) => (
                  <Tooltip label={copied ? t("share.copied") : t("share.copy")} withArrow>
                    <ActionIcon
                      variant="subtle"
                      color={copied ? "teal" : "gray"}
                      onClick={copy}
                      aria-label={t("share.copy")}
                    >
                      {copied ? <Check size={15} /> : <Copy size={15} />}
                    </ActionIcon>
                  </Tooltip>
                )}
              </CopyButton>
            </div>
            {primaryAction}
            <Tooltip label={t("share.openNewTab")} withArrow>
              <ActionIcon
                component="a"
                href={url}
                target="_blank"
                rel="noreferrer"
                variant="default"
                size={36}
                aria-label={t("share.openAria")}
              >
                <ExternalLink size={15} />
              </ActionIcon>
            </Tooltip>
          </div>

          <div className={classes.linkFoot}>
            <span className={classes.opens}>
              <Eye size={14} />
              <strong>
                {views === 1
                  ? t("share.opensOne", { count: num(views) })
                  : t("share.opensOther", { count: num(views) })}
              </strong>
              <span>
                ·{" "}
                {lastViewedAt
                  ? t("share.lastOpenedShort", { ago: timeAgo(lastViewedAt) })
                  : t("share.notOpenedShort")}
              </span>
            </span>
            <span className={classes.footSpacer} />
            <span className={classes.hint}>{t("share.linkWarning")}</span>
            <Tooltip label={t("share.replaceHint")} withArrow multiline w={260}>
              <Anchor component="button" type="button" size="xs" c="red" onClick={onReplace} disabled={busy}>
                {t("share.replaceLinkShort")}
              </Anchor>
            </Tooltip>
          </div>
        </div>
      ) : (
        offContent && <div className={classes.linkBody}>{offContent}</div>
      )}
    </div>
  );
}
