import { useState } from "react";
import { Button, Tooltip } from "@mantine/core";
import { Layers, Play } from "lucide-react";
import type { SeoCrawlReport, SeoCrawlPage } from "@/shared/types";
import { num, timeAgo } from "@/shared/lib";
import { EmptyState } from "@/shared/ui/EmptyState";
import { Pill, SeverityIcon, StatusMark } from "@/features/seo/components/shared/Pill";
import { ListEmpty, ListHead, ListRow, ListTitle, SeoList } from "@/features/seo/components/shared/SeoList";
import { Tile, Tiles } from "@/features/seo/components/shared/Tile";
import { lengthTone, scoreTone } from "@/features/seo/components/shared/tone";
import sharedClasses from "@/features/seo/components/shared/seoUi.module.css";
import classes from "@/features/seo/components/panels/site/site.module.css";

const PAGES_SHOWN = 12;

export function CrawlPanel({
  report,
  running,
  onCrawl,
}: {
  report?: SeoCrawlReport;
  running: boolean;
  onCrawl: (() => void) | null;
}) {
  const [showAll, setShowAll] = useState(false);

  if (!report) {
    return (
      <EmptyState
        icon={Layers}
        title="No crawl yet"
        description="A crawl reads your sitemap and checks up to 30 pages at once, finding what a single-page audit cannot see: duplicate titles, thin pages, and sitemap URLs that no longer load."
        action={onCrawl ? { label: "Crawl this site", icon: Play, loading: running, onClick: onCrawl } : undefined}
        actionNote={onCrawl ? "Takes a few seconds and uses no PageSpeed quota." : undefined}
      />
    );
  }

  const { data } = report;
  const pages = showAll ? data.pages : data.pages.slice(0, PAGES_SHOWN);

  return (
    <div className={classes.stack}>
      <Tiles>
        <Tile label="Pages crawled" value={num(data.crawled)} note={`Crawled ${timeAgo(report.createdAt)}`} />
        <Tile label="Average score" value={String(data.score)} tone={scoreTone(data.score)} />
        <Tile label="In sitemap" value={num(data.discovered)} />
        <Tile label="Findings" value={num(data.findings.length)} tone={data.findings.length ? "warn" : undefined} />
      </Tiles>

      <SeoList>
        <div className={classes.toolbar}>
          <span className={sharedClasses.cardTitle}>Site-wide findings</span>
          {onCrawl && (
            <Button size="xs" variant="default" leftSection={<Play size={13} />} loading={running} onClick={onCrawl}>
              Crawl again
            </Button>
          )}
        </div>
        {data.findings.length ? (
          data.findings.map((f, i) => (
            <ListRow
              key={i}
              top
              lead={<SeverityIcon severity={f.severity} />}
              title={f.title}
              sub={
                <>
                  {f.detail}
                  {f.pages.length > 0 && (
                    <span className={classes.findingPages}>
                      {f.pages.map((p) => (
                        <Pill key={p} mono>{p}</Pill>
                      ))}
                    </span>
                  )}
                </>
              }
            />
          ))
        ) : (
          <ListRow
            lead={<StatusMark ok />}
            title="No site-wide problems"
            sub={`Across ${data.crawled} pages: no duplicate titles, no thin content, and every sitemap URL loads.`}
          />
        )}
      </SeoList>

      <SeoList>
        <ListTitle>
          <span className={classes.colGrow}>Pages · {data.pages.length}</span>
          {data.pages.length > PAGES_SHOWN && (
            <Button size="xs" variant="subtle" onClick={() => setShowAll((v) => !v)}>
              {showAll ? "Show fewer" : `Show all ${data.pages.length}`}
            </Button>
          )}
        </ListTitle>
        <ListHead>
          <span className={classes.colPath}>Path</span>
          <span className={classes.colGrow}>Title</span>
          <span className={classes.colNum}>Words</span>
          <span className={classes.colNum}>Desc</span>
          <span className={classes.colNum}>Status</span>
        </ListHead>
        {pages.length ? pages.map((p) => <PageRow key={p.url} page={p} />) : <ListEmpty>No pages crawled.</ListEmpty>}
      </SeoList>
    </div>
  );
}

function PageRow({ page }: { page: SeoCrawlPage }) {
  const bad = page.statusCode >= 400 || Boolean(page.error);
  return (
    <div className={sharedClasses.row}>
      <span className={`${classes.colPath} ${classes.truncate} ${sharedClasses.mono}`} title={page.path}>
        {page.path}
      </span>
      <span className={`${classes.colGrow} ${classes.truncate} ${sharedClasses.rowText}`} title={page.title ?? ""}>
        {page.title || "Untitled"}
        {page.noindex && (
          <>
            {" "}
            <Tooltip label="This page tells search engines not to index it" withArrow>
              <span>
                <Pill tone="bad">noindex</Pill>
              </span>
            </Tooltip>
          </>
        )}
      </span>
      <span className={`${classes.colNum} ${sharedClasses.rowMeta}`}>{num(page.wordCount)}</span>
      <span className={classes.colNum}>
        <Pill tone={lengthTone(page.descriptionLength, 70, 160)}>{page.descriptionLength || "—"}</Pill>
      </span>
      <span className={classes.colNum}>
        <Pill tone={bad ? "bad" : "good"}>{page.error ? "Error" : page.statusCode}</Pill>
      </span>
    </div>
  );
}
