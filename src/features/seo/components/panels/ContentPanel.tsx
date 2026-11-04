import { Progress } from "@mantine/core";
import type { SeoContent } from "@/shared/types";
import { compact } from "@/shared/lib";
import { Empty } from "@/features/seo/components/shared/Panel";
import { SeoCard } from "@/features/seo/components/shared/SeoCard";
import { Pill } from "@/features/seo/components/shared/Pill";
import { Tile, Tiles } from "@/features/seo/components/shared/Tile";
import { readabilityBand } from "@/features/seo/components/utils";
import sharedClasses from "@/features/seo/components/shared/seoUi.module.css";
import classes from "./onpage.module.css";

const HEADINGS_SHOWN = 6;

function qualityColor(value: number): string {
  return value >= 70 ? "var(--green)" : value >= 40 ? "var(--amber)" : "var(--red)";
}

function Meter({ value, label }: { value: number; label: string }) {
  return (
    <div className={classes.meter}>
      <Progress
        value={value}
        color={qualityColor(value)}
        size={8}
        radius="xl"
        className={classes.meterTrack}
        classNames={{ root: sharedClasses.track }}
        aria-label={`${label} ${value}`}
      />
      <span className={classes.meterLabel}>{label}</span>
    </div>
  );
}

export function ContentPanel({ content }: { content: SeoContent }) {
  const band = readabilityBand(content.readabilityScore);
  const outline = content.headingStructure.flatMap((h) =>
    h.texts.slice(0, HEADINGS_SHOWN).map((text, i) => ({ level: h.level, text, key: `${h.level}-${i}` }))
  );

  return (
    <div className={classes.stack}>
      <Tiles>
        <Tile
          label="Words"
          value={compact(content.wordCount)}
          tone={content.wordCount >= 300 ? undefined : "warn"}
          hint="300+ is a reasonable floor for a page meant to rank."
        />
        <Tile
          label="H1 headings"
          value={String(content.h1Count)}
          tone={content.h1Count === 1 ? undefined : "warn"}
          hint="Exactly one H1 per page."
        />
        <Tile label="H2 / H3" value={`${content.h2Count} / ${content.h3Count}`} />
        <Tile label="Internal links" value={compact(content.internalLinks)} />
        <Tile label="External links" value={compact(content.externalLinks)} />
        <Tile label="Images" value={compact(content.imgCount)} />
      </Tiles>

      <div className="seo-bento">
        <SeoCard className="col-7" title="Heading structure" description="How the page is outlined for crawlers.">
          {outline.length ? (
            <div className={classes.scroll}>
              {outline.map((h) => (
                <div key={h.key} className={classes.headingRow} data-level={h.level}>
                  <Pill tone="info" mono>H{h.level}</Pill>
                  <span className={classes.headingText} title={h.text}>
                    {h.text}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <Empty>No headings found. Crawlers use headings to understand what a page covers.</Empty>
          )}
        </SeoCard>

        <SeoCard className="col-5" title="Top keywords" description="Share of body text, common words left out.">
          {content.keywordDensity.length ? (
            <div className={classes.chips}>
              {content.keywordDensity.map((k) => (
                <span key={k.word} className={classes.chip} title={`${k.density}% of body text`}>
                  {k.word}
                  <span className={classes.chipCount}>{k.count}</span>
                </span>
              ))}
            </div>
          ) : (
            <Empty>Not enough text on this page to measure keyword density.</Empty>
          )}

          <h4 className={classes.subTitle}>Readability</h4>
          <Meter value={content.readabilityScore} label={band.label} />

          <h4 className={classes.subTitle}>Content quality</h4>
          <Meter value={content.contentQuality} label={`${content.contentQuality} / 100`} />
        </SeoCard>
      </div>
    </div>
  );
}
