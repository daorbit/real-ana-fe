import { Anchor } from "@mantine/core";
import type { SeoContent } from "@/shared/types";
import { Pill } from "@/features/seo/components/shared/Pill";
import { ListEmpty, ListHead, SeoList } from "@/features/seo/components/shared/SeoList";
import { Thumb } from "@/features/seo/components/shared/Thumb";
import { Tile, Tiles } from "@/features/seo/components/shared/Tile";
import sharedClasses from "@/features/seo/components/shared/seoUi.module.css";
import classes from "./onpage.module.css";

export function ImagesPanel({ content }: { content: SeoContent }) {
  const images = content.images;
  const missingAlt = images.filter((i) => !i.hasAlt).length;
  const lazy = images.filter((i) => i.loading === "lazy").length;
  const noDimensions = images.filter((i) => !i.width || !i.height).length;

  return (
    <div className={classes.stack}>
      <Tiles>
        <Tile label="Images" value={String(images.length)} />
        <Tile label="Missing alt" value={String(missingAlt)} tone={missingAlt ? "warn" : undefined} />
        <Tile
          label="No dimensions"
          value={String(noDimensions)}
          tone={noDimensions ? "warn" : undefined}
          hint="Images without width and height are the usual cause of layout shift."
        />
        <Tile label="Lazy loaded" value={String(lazy)} />
      </Tiles>

      <SeoList>
        <ListHead>
          <span className={classes.colPreview}>Preview</span>
          <span className={classes.colGrow}>Source</span>
          <span className={classes.colSize}>Size</span>
          <span className={classes.colLoading}>Loading</span>
          <span className={classes.colAlt}>Alt text</span>
        </ListHead>
        {images.length ? (
          <div className={classes.scroll}>
            {images.map((img, i) => (
              <div key={`${img.src}-${i}`} className={sharedClasses.row}>
                <span className={classes.colPreview}>
                  <Thumb src={img.src} alt={img.alt} size={40} />
                </span>
                <Anchor
                  href={img.src}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${classes.colGrow} ${classes.truncate} ${sharedClasses.mono}`}
                >
                  {img.src}
                </Anchor>
                <span className={`${classes.colSize} ${sharedClasses.rowMeta}`}>
                  {img.width && img.height ? `${img.width} × ${img.height}` : "—"}
                </span>
                <span className={`${classes.colLoading} ${sharedClasses.rowMeta}`}>
                  {img.loading === "lazy" ? "Lazy" : "Eager"}
                </span>
                <span className={`${classes.colAlt} ${classes.truncate} ${sharedClasses.rowSub}`} title={img.alt}>
                  {img.hasAlt ? img.alt || "Decorative" : <Pill tone="warn">Missing</Pill>}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <ListEmpty>No images on this page.</ListEmpty>
        )}
      </SeoList>
    </div>
  );
}
