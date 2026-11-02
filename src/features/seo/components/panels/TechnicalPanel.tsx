import type { SeoSiteFiles, SeoTechnical } from "@/shared/types";
import { num } from "@/shared/lib";
import { CheckRow } from "@/features/seo/components/shared/Panel";
import { FactStrip, type Fact } from "@/features/seo/components/shared/FactStrip";
import { SeoList } from "@/features/seo/components/shared/SeoList";
import { pageSize } from "@/features/seo/components/utils";
import { CrawlerFilesCard, CrawlerFilesPanel } from "./site/CrawlerFilesPanel";
import classes from "./site/site.module.css";

function responseFacts(technical: SeoTechnical): Fact[] {
  const { statusCode, responseTimeMs } = technical;
  return [
    {
      label: "Status code",
      value: String(statusCode),
      tone: statusCode < 300 ? "good" : statusCode < 400 ? "warn" : "bad",
    },
    {
      label: "Response time",
      value: `${num(responseTimeMs)} ms`,
      tone: responseTimeMs < 600 ? "good" : responseTimeMs < 1500 ? "warn" : "bad",
    },
    { label: "Page size", value: pageSize(technical.contentLength) },
    { label: "Server", value: technical.server || "—" },
    { label: "Content type", value: technical.contentType.split(";")[0] || "—" },
  ];
}

export function TechnicalPanel({ technical, siteFiles }: { technical: SeoTechnical; siteFiles: SeoSiteFiles }) {
  const missingAlt = technical.missingAltImages;

  return (
    <div className={classes.stack}>
      <FactStrip facts={responseFacts(technical)} />

      <div className="seo-bento">
        <SeoList className="col-8">
          <CheckRow ok={technical.hasHttps} label="Served over HTTPS" />
          <CheckRow ok={technical.hasMobileViewport} label="Mobile viewport tag" />
          <CheckRow ok={technical.hasFavicon} label="Favicon" />
          <CheckRow ok={technical.hasOpenGraph} label="Open Graph tags" />
          <CheckRow ok={technical.hasTwitterCards} label="Twitter Card tags" />
          <CheckRow ok={technical.hasStructuredData} label="Structured data (JSON-LD)" />
          <CheckRow
            ok={missingAlt === 0}
            label="All images have alt text"
            state={missingAlt ? `${missingAlt} missing` : `${technical.imageAltCount} of ${technical.totalImages}`}
          />
        </SeoList>
        <CrawlerFilesCard className="col-4" siteFiles={siteFiles} hasFavicon={technical.hasFavicon} />
      </div>

      <CrawlerFilesPanel robots={siteFiles.robotsReport} sitemap={siteFiles.sitemapReport} />
    </div>
  );
}
