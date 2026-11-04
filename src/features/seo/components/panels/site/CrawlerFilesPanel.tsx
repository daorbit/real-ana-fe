import { compact } from "@/shared/lib";
import type { SeoRobotsReport, SeoSiteFiles, SeoSitemapReport } from "@/shared/types";
import { Pill, SeverityIcon, StatusMark } from "@/features/seo/components/shared/Pill";
import { ListRow, ListTitle, SeoList } from "@/features/seo/components/shared/SeoList";
import classes from "./site.module.css";

type Finding = { severity: "critical" | "warning" | "info"; message: string; line?: number | null };

function found(ok: boolean) {
  return <Pill tone={ok ? "good" : "warn"}>{ok ? "Found" : "Missing"}</Pill>;
}

export function CrawlerFilesCard({
  siteFiles,
  hasFavicon,
  className,
}: {
  siteFiles: SeoSiteFiles;
  hasFavicon: boolean;
  className?: string;
}) {
  const robots = siteFiles.robotsReport;
  const sitemap = siteFiles.sitemapReport;
  const robotsOk = robots?.present ?? siteFiles.robotsTxt.present;
  const sitemapOk = sitemap?.present ?? siteFiles.sitemap.present;

  return (
    <SeoList className={className}>
      <ListTitle>Crawler files</ListTitle>
      <ListRow
        title="robots.txt"
        sub={
          robots?.present
            ? `${robots.groups.length} rule group${robots.groups.length === 1 ? "" : "s"} · ${robots.sitemaps.length} sitemap link${robots.sitemaps.length === 1 ? "" : "s"}`
            : siteFiles.robotsTxt.url
        }
        clip
        aside={found(robotsOk)}
      />
      <ListRow
        title="Sitemap"
        sub={
          sitemap?.present
            ? `${compact(sitemap.urlCount)} URL${sitemap.urlCount === 1 ? "" : "s"}${sitemap.isIndex ? " · sitemap index" : ""}`
            : siteFiles.sitemap.urls[0] ?? "Not referenced in robots.txt or at /sitemap.xml"
        }
        clip
        aside={found(sitemapOk)}
      />
      <ListRow title="Favicon" aside={found(hasFavicon)} />
      {robots?.content && (
        <details className={classes.fileBody}>
          <summary className={classes.fileSummary}>View robots.txt</summary>
          <pre className={classes.code}>{robots.content}</pre>
        </details>
      )}
    </SeoList>
  );
}

function findingsOf(robots?: SeoRobotsReport, sitemap?: SeoSitemapReport): (Finding & { file: string })[] {
  return [
    ...(robots?.findings ?? []).map((f) => ({ ...f, file: "robots.txt" })),
    ...(sitemap?.findings ?? []).map((f) => ({ ...f, file: "Sitemap" })),
  ];
}

export function CrawlerFilesPanel({ robots, sitemap }: { robots?: SeoRobotsReport; sitemap?: SeoSitemapReport }) {
  const findings = findingsOf(robots, sitemap);
  if (!findings.length && !robots?.blocksEverything && !robots?.blocksAuditedUrl) return null;

  return (
    <SeoList>
      <ListTitle>Crawler file findings · {findings.length}</ListTitle>
      {robots?.blocksEverything && (
        <ListRow
          lead={<StatusMark ok={false} tone="bad" />}
          title="This site is blocked from every search engine"
          sub="robots.txt has Disallow: / for all crawlers, so nothing on this domain can appear in search results."
        />
      )}
      {robots?.blocksAuditedUrl && !robots.blocksEverything && (
        <ListRow
          lead={<StatusMark ok={false} tone="bad" />}
          title="robots.txt blocks this page"
          sub="It cannot be crawled or indexed until the rule changes."
        />
      )}
      {findings.map((f, i) => (
        <ListRow
          key={i}
          top
          lead={<SeverityIcon severity={f.severity} />}
          title={f.line != null ? `${f.file}, line ${f.line}` : f.file}
          sub={f.message}
        />
      ))}
    </SeoList>
  );
}
