import { ActionIcon, CopyButton, Menu, Tooltip } from "@mantine/core";
import { Check, Copy, ExternalLink, MoreHorizontal, RefreshCw, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { num, timeAgo } from "@/shared/lib";
import type { SeoShareLink } from "@/shared/types";
import { ScoreChip } from "./ScoreChip";
import { prettyUrl } from "./prettyUrl";
import classes from "../Share.module.css";

export function SeoLinkRow({
  link,
  onReplace,
  onRemove,
}: {
  link: SeoShareLink;
  onReplace: () => void;
  onRemove: () => void;
}) {
  const { t } = useTranslation();
  const url = `${window.location.origin}/seo-report/${link.token}`;
  const opens = link.views === 1
    ? t("share.opensOne", { count: num(link.views) })
    : t("share.opensOther", { count: num(link.views) });

  return (
    <div className={classes.linkItem}>
      <ScoreChip score={link.score} />
      <div className={classes.auditText}>
        <span className={classes.auditUrl}>{prettyUrl(link.url)}</span>
        <span className={classes.auditMeta}>
          {t("share.auditedAgo", { when: timeAgo(link.createdAt) })} · {opens}
        </span>
      </div>
      <div className={classes.linkItemActions}>
        <CopyButton value={url} timeout={1600}>
          {({ copied, copy }) => (
            <Tooltip label={copied ? t("share.copied") : t("share.copyLink", "Copy link")} withArrow>
              <ActionIcon variant="default" size={34} onClick={copy} aria-label={t("share.copyLink", "Copy link")}>
                {copied ? <Check size={15} /> : <Copy size={15} />}
              </ActionIcon>
            </Tooltip>
          )}
        </CopyButton>
        <Tooltip label={t("share.openNewTab")} withArrow>
          <ActionIcon
            component="a"
            href={url}
            target="_blank"
            rel="noreferrer"
            variant="default"
            size={34}
            aria-label={t("share.openAria")}
          >
            <ExternalLink size={15} />
          </ActionIcon>
        </Tooltip>
        <Menu position="bottom-end" withinPortal>
          <Menu.Target>
            <ActionIcon variant="subtle" color="gray" size={34} aria-label={t("share.moreActions", "More actions")}>
              <MoreHorizontal size={16} />
            </ActionIcon>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Item leftSection={<RefreshCw size={14} />} onClick={onReplace}>
              {t("share.replaceLinkShort")}
            </Menu.Item>
            <Menu.Divider />
            <Menu.Item color="red" leftSection={<Trash2 size={14} />} onClick={onRemove}>
              {t("share.removePage", "Remove page")}
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </div>
    </div>
  );
}
