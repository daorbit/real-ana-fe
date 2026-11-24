import { usePermissions } from "@/features/workspace/context";
import { compact } from "@/shared/lib";
import type { IndexCounts } from "../../indexing";
import { IndexCheckButton } from "./IndexCheckButton";
import layout from "../searchConsole.module.css";
import classes from "./indexing.module.css";

function pagesText(n: number) {
  return `${compact(n)} page${n === 1 ? "" : "s"}`;
}

export function IndexHeadline({
  workspaceId,
  siteId,
  propertyUrl,
  counts,
  sitemapPages,
}: {
  workspaceId: string;
  siteId: string;
  propertyUrl: string;
  counts: IndexCounts;
  sitemapPages: number;
}) {
  const { canEdit } = usePermissions();
  const reportUrl = `https://search.google.com/search-console/index?resource_id=${encodeURIComponent(propertyUrl)}`;

  return (
    <section className={`${layout.headline} ${classes.headline}`} aria-label="Indexing summary">
      <div className={layout.headlineText}>
        <p className={layout.headlineTitle}>
          {counts.checked > 0 ? (
            <>
              <b>{compact(counts.indexed)}</b> of the <b>{pagesText(counts.checked)}</b> checked{" "}
              {counts.checked === 1 ? "is" : "are"} on Google.
            </>
          ) : (
            <>
              Found <b>{pagesText(counts.all)}</b> to check with Google.
            </>
          )}
        </p>
        <p className={layout.headlineSub}>
          {sitemapPages > 0
            ? `From your sitemap (${pagesText(sitemapPages)}) and Google results, up to 500 pages. `
            : "No sitemap pages were found, so this uses pages from Google results. "}
          Pages not seen in results are checked first. Google&apos;s full report is only in{" "}
          <a href={reportUrl} target="_blank" rel="noopener noreferrer" className={layout.learnMore}>
            Search Console
          </a>
          .
        </p>
      </div>
      {canEdit && counts.all > 0 && <IndexCheckButton workspaceId={workspaceId} siteId={siteId} />}
    </section>
  );
}
