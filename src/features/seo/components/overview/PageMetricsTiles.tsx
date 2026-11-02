import type { SeoContent, SeoPerformance, SeoTechnical } from "@/shared/types";
import { num } from "@/shared/lib";
import { Tile, Tiles } from "@/features/seo/components/shared/Tile";
import { pageSize, readabilityBand } from "@/features/seo/components/utils";

export function PageMetricsTiles({
  content,
  technical,
  performance,
}: {
  content: SeoContent;
  technical: SeoTechnical;
  performance: SeoPerformance;
}) {
  const requests = performance.diagnostics?.totalRequests ?? null;
  const missingAlt = technical.missingAltImages;

  return (
    <div className="col-12">
      <Tiles>
        <Tile
          label="Words"
          value={num(content.wordCount)}
          note={content.wordCount >= 300 ? "Good length" : "Thin page"}
          tone={content.wordCount >= 300 ? undefined : "warn"}
        />
        <Tile label="Response" value={`${num(technical.responseTimeMs)} ms`} note="Server response" />
        <Tile label="Page size" value={pageSize(technical.contentLength)} note="HTML document" />
        {requests !== null && <Tile label="Requests" value={num(requests)} note="All resources" />}
        <Tile
          label="Images"
          value={num(technical.totalImages)}
          note={missingAlt ? `${missingAlt} without alt` : "All have alt text"}
        />
        <Tile
          label="Links"
          value={num(content.linkCount)}
          note={`${num(content.internalLinks)} internal`}
        />
        {requests === null && (
          <Tile label="Readability" value={String(content.readabilityScore)} note={readabilityBand(content.readabilityScore).label} />
        )}
      </Tiles>
    </div>
  );
}
