import { ActionIcon, Menu, Switch, Tooltip } from "@mantine/core";
import { Copy, ExternalLink, MoreHorizontal, Pencil, Trash2, UserRound } from "lucide-react";
import { Link } from "react-router-dom";
import { num } from "@/shared/lib";
import { clickRate, publicBioDisplay, publicBioUrl } from "@/features/bio/lib/bioOptions";
import type { BioPage } from "@/features/bio/types";
import classes from "./BioPages.module.css";

export function BioPageCard({
  page,
  canEdit,
  busy,
  onTogglePublished,
  onCopy,
  onDelete,
}: {
  page: BioPage;
  canEdit: boolean;
  busy: boolean;
  onTogglePublished: (published: boolean) => void;
  onCopy: () => void;
  onDelete: () => void;
}) {
  const linksOn = page.links.filter((link) => link.enabled).length;

  return (
    <article className={classes.card} data-busy={busy || undefined}>
      <div className={classes.cardHead}>
        <span className={classes.avatar} aria-hidden>
          {page.avatarUrl ? <img src={page.avatarUrl} alt="" className={classes.avatarImage} /> : <UserRound size={20} />}
        </span>
        <div className={classes.identity}>
          <Link to={`/app/bio/${page.id}`} className={classes.title}>
            {page.title}
          </Link>
          <span className={classes.address}>{publicBioDisplay(page.slug)}</span>
        </div>
        {canEdit && (
          <Menu position="bottom-end" width={190}>
            <Menu.Target>
              <ActionIcon variant="subtle" color="gray" aria-label={`More for ${page.title}`}>
                <MoreHorizontal size={17} />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item component={Link} to={`/app/bio/${page.id}`} leftSection={<Pencil size={14} />}>
                Edit page
              </Menu.Item>
              <Menu.Item color="red" leftSection={<Trash2 size={14} />} onClick={onDelete}>
                Delete
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        )}
      </div>

      <div className={classes.stats}>
        <div className={classes.stat}>
          <span className={classes.statValue}>{num(page.stats.views)}</span>
          <span className={classes.statLabel}>Views</span>
        </div>
        <div className={classes.stat}>
          <span className={classes.statValue}>{num(page.stats.clicks)}</span>
          <span className={classes.statLabel}>Clicks</span>
        </div>
        <div className={classes.stat}>
          <span className={classes.statValue}>{clickRate(page.stats.views, page.stats.clicks)}</span>
          <span className={classes.statLabel}>Click rate</span>
        </div>
      </div>

      <div className={classes.cardFoot}>
        <Switch
          size="sm"
          label={page.published ? "Live" : "Draft"}
          checked={page.published}
          disabled={!canEdit || busy}
          onChange={(e) => onTogglePublished(e.currentTarget.checked)}
        />
        <span className={classes.meta}>
          {linksOn} link{linksOn === 1 ? "" : "s"}
        </span>
        <div className={classes.footActions}>
          <Tooltip label="Copy link" withArrow>
            <ActionIcon variant="subtle" color="gray" aria-label="Copy link" onClick={onCopy}>
              <Copy size={15} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label={page.published ? "Open page" : "Publish to open"} withArrow>
            <ActionIcon
              component="a"
              href={publicBioUrl(page.slug)}
              target="_blank"
              rel="noopener noreferrer"
              variant="subtle"
              color="gray"
              aria-label="Open page"
              disabled={!page.published}
            >
              <ExternalLink size={15} />
            </ActionIcon>
          </Tooltip>
        </div>
      </div>
    </article>
  );
}
