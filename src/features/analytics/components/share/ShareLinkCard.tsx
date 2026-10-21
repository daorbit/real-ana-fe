import type { ReactNode } from "react";
import { ActionIcon, Anchor, CopyButton, Tooltip } from "@mantine/core";
import { Check, Copy, ExternalLink, Eye } from "lucide-react";
import { useTranslation } from "react-i18next";
import { num, timeAgo } from "@/shared/lib";
import { NativeShareButton } from "@/shared/ui/NativeShareButton";
import classes from "./Share.module.css";

interface Props {
  title: string;
  description: string;
  busy: boolean;
  url: string;
  views: number;
  lastViewedAt?: string | null;
  onReplace: () => void;
  headerAction?: ReactNode;
  primaryAction?: ReactNode;
  footerAction?: ReactNode;
}

export function ShareLinkCard({
  title, description, busy, url, views, lastViewedAt, onReplace, headerAction, primaryAction, footerAction,
}: Props) {
  const { t } = useTranslation();

  return (
    <div className={classes.card}>
      <div className={classes.linkHead}>
        <div className={classes.linkIntro}>
          <div className={classes.linkTitle}>
            {title}
            <span className={classes.status} data-live>
              <span className={classes.statusDot} />
              {t("share.live")}
            </span>
          </div>
          <div className={classes.linkDesc}>{description}</div>
        </div>
        {headerAction}
      </div>

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
          <NativeShareButton url={url} title={title} />
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
          {footerAction}
          <Tooltip label={t("share.replaceHint")} withArrow multiline w={260}>
            <Anchor component="button" type="button" size="xs" c="red" onClick={onReplace} disabled={busy}>
              {t("share.replaceLinkShort")}
            </Anchor>
          </Tooltip>
        </div>
      </div>
    </div>
  );
}
