import { useState } from "react";
import { Card, SegmentedControl } from "@mantine/core";
import { Maximize2 } from "lucide-react";
import type { SeoPerformance } from "@/shared/types";
import { ScreenshotModal } from "./ScreenshotModal";
import classes from "./overviewCards.module.css";

type View = "mobile" | "desktop";

export function pageScreenshots(performance: SeoPerformance) {
  return {
    mobile: performance.mobile?.screenshot ?? null,
    desktop: performance.desktop?.screenshot ?? null,
  };
}

function capturedOn(fetchTime?: string): string {
  if (!fetchTime) return "";
  const date = new Date(fetchTime);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

export function PagePreviewCard({ performance }: { performance: SeoPerformance }) {
  const shots = pageScreenshots(performance);
  const [view, setView] = useState<View>(shots.desktop ? "desktop" : "mobile");
  const [zoomed, setZoomed] = useState(false);
  const active: View = shots[view] ? view : shots.desktop ? "desktop" : "mobile";
  const src = shots[active];
  const date = capturedOn(performance.fetchTime);

  if (!src) return null;

  return (
    <Card withBorder radius="md" padding="lg" className={`col-4 seo-panel ${classes.fill}`}>
      <div className={classes.head}>
        <span className={classes.title}>Page preview</span>
        {shots.mobile && shots.desktop && (
          <SegmentedControl
            size="xs"
            value={active}
            onChange={(value) => setView(value as View)}
            data={[
              { value: "desktop", label: "Desktop" },
              { value: "mobile", label: "Mobile" },
            ]}
          />
        )}
      </div>

      <button
        type="button"
        className={classes.preview}
        data-view={active}
        onClick={() => setZoomed(true)}
        aria-label={`Open the ${active} screenshot full size`}
      >
        <img
          src={src}
          alt={`How the page looked to Google on ${active}`}
          className={classes.previewImg}
          loading="lazy"
          decoding="async"
        />
        <span className={classes.previewHint}>
          <Maximize2 size={13} aria-hidden />
          View full size
        </span>
      </button>

      <ScreenshotModal src={src} view={active} opened={zoomed} onClose={() => setZoomed(false)} />

      <div className={classes.previewCaption}>
        As Google loaded it{date ? ` · ${date}` : ""}
      </div>
    </Card>
  );
}
