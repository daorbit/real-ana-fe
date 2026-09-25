import { useTranslation } from "react-i18next";
import type { SharePanels } from "@/shared/types";
import classes from "./Share.module.css";

type Key = keyof SharePanels;

/**
 * Rows of the public page, top to bottom, as blocks sized roughly like the real
 * panels. Only panels that are on are drawn, so the preview is exactly what a
 * visitor would get.
 */
const ROWS: { key: Key; kind: "tiles" | "chart" | "list" | "small" }[][] = [
  [{ key: "totals", kind: "tiles" }],
  [{ key: "trend", kind: "chart" }],
  [{ key: "engagement", kind: "small" }, { key: "visitorSplit", kind: "small" }],
  [{ key: "pages", kind: "list" }, { key: "entryPages", kind: "list" }, { key: "exitPages", kind: "list" }],
  [{ key: "sources", kind: "list" }, { key: "channels", kind: "list" }],
  [{ key: "countries", kind: "list" }, { key: "languages", kind: "list" }],
  [{ key: "devices", kind: "small" }, { key: "browsers", kind: "small" }, { key: "operatingSystems", kind: "small" }],
];

export function LayoutPreview({ panels, workspace }: { panels: SharePanels; workspace: string }) {
  const { t } = useTranslation();
  const rows = ROWS.map((r) => r.filter((b) => panels[b.key])).filter((r) => r.length);

  return (
    <div className={classes.preview}>
      <div className={classes.previewChrome}>
        <span />
        <span />
        <span />
        <div className={classes.previewAddr}>{workspace}</div>
      </div>
      <div className={classes.previewPage}>
        {rows.length === 0 ? (
          <div className={classes.previewEmpty}>{t("share.previewEmpty")}</div>
        ) : (
          rows.map((row, i) => (
            <div key={i} className={classes.previewRow}>
              {row.map((b) => (
                <div key={b.key} className={classes.block} data-kind={b.kind}>
                  <span className={classes.blockLabel}>{t(`share.panel.${b.key}`)}</span>
                  {b.kind === "tiles" && (
                    <div className={classes.tiles}>
                      <i />
                      <i />
                      <i />
                    </div>
                  )}
                  {b.kind === "chart" && (
                    <svg className={classes.spark} viewBox="0 0 100 24" preserveAspectRatio="none" aria-hidden>
                      <polyline points="0,18 12,14 24,16 36,9 48,12 60,6 72,10 84,4 100,7" />
                    </svg>
                  )}
                  {b.kind === "list" && (
                    <div className={classes.bars}>
                      <i style={{ width: "88%" }} />
                      <i style={{ width: "62%" }} />
                      <i style={{ width: "40%" }} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
