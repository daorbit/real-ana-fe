import type { SeoSiteFiles, SeoTechnical } from "@/shared/types";
import { SeoCard } from "@/features/seo/components/shared/SeoCard";
import { StatusMark } from "@/features/seo/components/shared/Pill";
import classes from "./overviewCards.module.css";

export function techChecks(technical: SeoTechnical, siteFiles: SeoSiteFiles) {
  return [
    { label: "Served over HTTPS", ok: technical.hasHttps },
    { label: "Mobile viewport tag", ok: technical.hasMobileViewport },
    { label: "Open Graph tags", ok: technical.hasOpenGraph },
    { label: "Twitter Card tags", ok: technical.hasTwitterCards },
    { label: "Structured data (JSON-LD)", ok: technical.hasStructuredData },
    { label: "robots.txt present", ok: siteFiles.robotsTxt.present },
    { label: "Sitemap referenced", ok: siteFiles.sitemap.present },
    { label: "All images have alt text", ok: technical.missingAltImages === 0 },
  ];
}

export function TechChecksCard({
  technical,
  siteFiles,
  wide,
}: {
  technical: SeoTechnical;
  siteFiles: SeoSiteFiles;
  wide: boolean;
}) {
  const rows = techChecks(technical, siteFiles);
  const passing = rows.filter((r) => r.ok).length;

  return (
    <SeoCard
      className={wide ? "col-12" : "col-8"}
      title="Technical checks"
      description="The basics search engines and social apps look for."
      right={<span className="seo-eyebrow">{passing} of {rows.length} passing</span>}
    >
      <div className={classes.checks}>
        {rows.map((r) => (
          <div key={r.label} className={classes.check}>
            <StatusMark ok={r.ok} />
            {r.label}
          </div>
        ))}
      </div>
    </SeoCard>
  );
}
