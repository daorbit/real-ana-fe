import { ActionIcon, Menu, Switch, Tooltip } from "@mantine/core";
import { ChartSpline, Copy, Disc3, ExternalLink, MoreHorizontal, Pencil, QrCode, Trash2, UserRound } from "lucide-react";
import { Link } from "react-router-dom";
import { num } from "@/shared/lib";
import { clickRate, publicBioDisplay, publicBioUrl } from "@/features/bio/lib/bioOptions";
import { trackedLinks } from "@/features/bio/lib/sampleBioStats";
import type { BioPage } from "@/features/bio/types";
import classes from "./BioPages.module.css";

function countLabel(page: BioPage): string {
  const count = trackedLinks(page).length;
  const noun = page.kind === "release" ? "service" : "link";
  return `${count} ${noun}${count === 1 ? "" : "s"}`;
}

function CardThumb({ page }: { page: BioPage }) {
  const release = page.kind === "release";
  const image = release ? page.release?.artworkUrl : page.avatarUrl;
  return (
    <span className={classes.avatar} data-shape={release ? "square" : "circle"} aria-hidden>
      {image ? (
        <img src={image} alt="" className={classes.avatarImage} />
      ) : release ? (
        <Disc3 size={20} strokeWidth={1.5} />
      ) : (
        <UserRound size={20} />
      )}
    </span>
  );
}

export function BioPageCard({
  page,
  canEdit,
  busy,
  onTogglePublished,
  onCopy,
  onQr,
  onDelete,
}: {
  page: BioPage;
  canEdit: boolean;
  busy: boolean;
  onTogglePublished: (published: boolean) => void;
  onCopy: () => void;
  onQr: () => void;
  onDelete: () => void;
}) {
  const statsPath = `/app/bio/${page.id}/stats`;

  return (
    <article className={classes.card} data-busy={busy || undefined}>
      <div className={classes.cardHead}>
        <CardThumb page={page} />
        <div className={classes.identity}>
          <Link to={`/app/bio/${page.id}`} className={classes.title}>
            {page.title || "Untitled"}
          </Link>
          <span className={classes.address}>{publicBioDisplay(page.slug)}</span>
        </div>
        <Menu position="bottom-end" width={190}>
          <Menu.Target>
            <ActionIcon variant="subtle" color="gray" aria-label={`More for ${page.title}`}>
              <MoreHorizontal size={17} />
            </ActionIcon>
          </Menu.Target>
          <Menu.Dropdown>
            {canEdit && (
              <Menu.Item component={Link} to={`/app/bio/${page.id}`} leftSection={<Pencil size={14} />}>
                Edit
              </Menu.Item>
            )}
            <Menu.Item component={Link} to={statsPath} leftSection={<ChartSpline size={14} />}>
              Stats
            </Menu.Item>
            <Menu.Item leftSection={<QrCode size={14} />} onClick={onQr}>
              QR code
            </Menu.Item>
            {canEdit && (
              <Menu.Item color="red" leftSection={<Trash2 size={14} />} onClick={onDelete}>
                Delete
              </Menu.Item>
            )}
          </Menu.Dropdown>
        </Menu>
      </div>

      <Link to={statsPath} className={classes.stats} aria-label={`Stats for ${page.title}`}>
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
      </Link>

      <div className={classes.cardFoot}>
        <Switch
          size="sm"
          label={page.published ? "Live" : "Draft"}
          checked={page.published}
          disabled={!canEdit || busy}
          onChange={(e) => onTogglePublished(e.currentTarget.checked)}
        />
        <span className={classes.meta}>{countLabel(page)}</span>
        <div className={classes.footActions}>
          <Tooltip label="Copy link" withArrow>
            <ActionIcon variant="subtle" color="gray" aria-label="Copy link" onClick={onCopy}>
              <Copy size={15} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="QR code" withArrow>
            <ActionIcon variant="subtle" color="gray" aria-label="QR code" onClick={onQr}>
              <QrCode size={15} />
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
