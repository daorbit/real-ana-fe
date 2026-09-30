import { Plus } from "lucide-react";
import { WIDGET_MAP } from "@/features/analytics/widgetCatalog";
import type { Placed, WidgetKind } from "@/features/analytics/widgetCatalog";
import classes from "@/features/dashboards/components/Dashboards.module.css";

const SPAN_CLASS = [classes.span1, classes.span1, classes.span2, classes.span3, classes.span4];

const CURVE = "M0,26 C10,22 16,27 26,19 C36,11 44,17 54,13 C64,9 72,4 82,8 C90,11 95,5 100,3";

function BlockContent({ kind }: { kind: WidgetKind }) {
  switch (kind) {
    case "metric":
      return (
        <>
          <i className={classes.bLabel} />
          <i className={classes.bValue} />
        </>
      );
    case "chart":
      return (
        <svg className={classes.bChart} viewBox="0 0 100 30" preserveAspectRatio="none">
          <path className={classes.bArea} d={`${CURVE} L100,30 L0,30 Z`} />
          <path className={classes.bLine} d={CURVE} />
        </svg>
      );
    case "map":
      return (
        <>
          <i className={classes.bLabel} />
          <i className={classes.bMap} />
        </>
      );
    case "live":
      return (
        <>
          <i className={classes.bPulse} />
          <i className={classes.bRow} data-w="2" />
          <i className={classes.bRow} data-w="3" />
        </>
      );
    default:
      return (
        <>
          <i className={classes.bLabel} />
          <i className={classes.bRow} data-w="1" />
          <i className={classes.bRow} data-w="2" />
          <i className={classes.bRow} data-w="3" />
        </>
      );
  }
}

export function LayoutThumb({
  layout,
  revealed,
  limit = 16,
}: {
  layout: Placed[];
  revealed?: number;
  limit?: number;
}) {
  if (layout.length === 0) {
    return (
      <div className={classes.thumbEmpty}>
        <span className={classes.thumbEmptyIcon}><Plus size={16} /></span>
        Empty canvas
      </div>
    );
  }

  return (
    <div className={classes.thumb} aria-hidden>
      {layout.slice(0, limit).map((p, i) => {
        const kind = WIDGET_MAP[p.id]?.kind ?? "list";
        return (
          <span
            key={p.id}
            className={`${classes.block} ${SPAN_CLASS[p.span]}`}
            data-kind={kind}
            data-pending={revealed !== undefined && i >= revealed ? "" : undefined}
            data-latest={revealed !== undefined && i === revealed - 1 ? "" : undefined}
          >
            <BlockContent kind={kind} />
          </span>
        );
      })}
    </div>
  );
}
