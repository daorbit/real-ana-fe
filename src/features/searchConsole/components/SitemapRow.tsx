import { AlertTriangle, CheckCircle2, Clock, FileText, XCircle } from "lucide-react";
import { num, timeAgo } from "@/shared/lib";
import type { SearchSitemap } from "@/shared/types";
import { sitemapPath } from "../sitemapUrl";
import { SitemapRowActions } from "./SitemapRowActions";
import classes from "./sitemaps.module.css";

function statusOf(sitemap: SearchSitemap) {
  if (sitemap.errors > 0) {
    return { tone: "bad", icon: XCircle, label: `${sitemap.errors} error${sitemap.errors === 1 ? "" : "s"}` };
  }
  if (sitemap.isPending) return { tone: "pending", icon: Clock, label: "Pending" };
  if (sitemap.warnings > 0) {
    return { tone: "warn", icon: AlertTriangle, label: `${sitemap.warnings} warning${sitemap.warnings === 1 ? "" : "s"}` };
  }
  return { tone: "good", icon: CheckCircle2, label: "Success" };
}

export function SitemapRow({
  sitemap,
  manage,
  busy,
  onResubmit,
  onRemove,
}: {
  sitemap: SearchSitemap;
  manage: boolean;
  busy: boolean;
  onResubmit: () => void;
  onRemove: () => void;
}) {
  const status = statusOf(sitemap);
  const StatusIcon = status.icon;
  const meta = [
    sitemap.submitted ? `${num(sitemap.submitted)} page${sitemap.submitted === 1 ? "" : "s"}` : null,
    sitemap.lastSubmitted ? `Submitted ${timeAgo(sitemap.lastSubmitted)}` : null,
    sitemap.lastDownloaded ? `Read by Google ${timeAgo(sitemap.lastDownloaded)}` : "Not read by Google yet",
  ].filter(Boolean) as string[];

  return (
    <li className={classes.row}>
      <span className={classes.fileIcon}>
        <FileText size={17} />
      </span>

      <div className={classes.rowMain}>
        <div className={classes.rowTitle}>
          <a href={sitemap.path} target="_blank" rel="noopener noreferrer" className={classes.rowPath} title={sitemap.path}>
            {sitemapPath(sitemap.path)}
          </a>
          {sitemap.isIndex && <span className={classes.tag}>Index</span>}
        </div>
        <div className={classes.rowMeta}>
          {meta.map((item, i) => (
            <span key={item} className={classes.metaItem}>
              {i > 0 && <span className={classes.metaDot} aria-hidden />}
              {item}
            </span>
          ))}
        </div>
      </div>

      <span className={classes.status} data-tone={status.tone}>
        <StatusIcon size={12} />
        {status.label}
      </span>

      {manage && (
        <span className={classes.actions}>
          <SitemapRowActions busy={busy} onResubmit={onResubmit} onRemove={onRemove} />
        </span>
      )}
    </li>
  );
}
