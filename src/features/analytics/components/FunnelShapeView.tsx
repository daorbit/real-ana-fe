import { useMemo } from "react";
import { num } from "@/shared/lib";
import type { FunnelResultStep } from "@/shared/types";

const VIEW_W = 720;
const ROW_H = 76;
/** Every step keeps a sliver of width, so a step that lost everyone is still a
 * visible band rather than a zero-height gap in the shape. */
const MIN_WIDTH_PCT = 0.05;
/** Room down each side for the step's own label, outside the shape. */
const GUTTER = 150;

/** Green while the step holds its traffic, amber then pink as it sheds it. */
function stepColor(dropFromPrev: number): string {
  if (dropFromPrev < 30) return "var(--green)";
  if (dropFromPrev < 60) return "var(--amber)";
  return "var(--pink)";
}

/** Cuts a long path so it fits the gutter instead of running off the canvas. */
function short(label: string, max = 22): string {
  return label.length <= max ? label : `${label.slice(0, max - 1)}…`;
}

/**
 * Each step as a trapezoid whose width tracks its share of the top step,
 * stacked top to bottom — the funnel shape people actually recognize, as
 * opposed to the flow-graph or list views.
 *
 * Labels sit in the gutters rather than on the shapes: a path is far wider
 * than a narrow band near the bottom of the funnel, and drawing it inside meant
 * every lower step's label overflowed the canvas.
 */
export function FunnelShapeView({ steps }: { steps: FunnelResultStep[] }) {
  const rows = useMemo(() => {
    const top = steps[0]?.count || 1;
    return steps.map((s, i) => ({
      ...s,
      i,
      widthFrac: Math.max(MIN_WIDTH_PCT, s.count / top),
      color: i === 0 ? "var(--accent-2)" : stepColor(s.dropFromPrev),
    }));
  }, [steps]);

  const height = rows.length * ROW_H;
  const shapeW = VIEW_W - GUTTER * 2;
  const cx = VIEW_W / 2;

  const polygons = rows.map((row, i) => {
    const next = rows[i + 1];
    const topHalf = (row.widthFrac * shapeW) / 2;
    const botHalf = ((next ? next.widthFrac : row.widthFrac) * shapeW) / 2;
    const y0 = i * ROW_H;
    const y1 = y0 + ROW_H;
    const points = [
      [cx - topHalf, y0],
      [cx + topHalf, y0],
      [cx + botHalf, y1],
      [cx - botHalf, y1],
    ]
      .map((p) => p.join(","))
      .join(" ");
    return { ...row, points, y0, y1, topHalf };
  });

  return (
    <div style={{ width: "100%", overflowX: "auto" }}>
      <svg
        viewBox={`0 0 ${VIEW_W} ${height}`}
        width="100%"
        height={height}
        role="img"
        aria-label="Funnel shape"
        style={{ fontFamily: "var(--font)", display: "block" }}
      >
        {polygons.map((p) => (
          <g key={p.i}>
            <polygon
              points={p.points}
              fill={p.color}
              fillOpacity={0.22}
              stroke={p.color}
              strokeWidth={1}
            />

            {/* Left gutter: which step this band is. */}
            <text
              x={GUTTER - 14}
              y={(p.y0 + p.y1) / 2 - 3}
              textAnchor="end"
              fontSize={12}
              fontWeight={600}
              fill="var(--text)"
            >
              {p.i + 1}. {short(p.label)}
            </text>
            <text
              x={GUTTER - 14}
              y={(p.y0 + p.y1) / 2 + 13}
              textAnchor="end"
              fontSize={11}
              fill="var(--muted)"
            >
              {p.rate}% of entries
            </text>

            {/* Inside the band: the count, which is short enough to always fit. */}
            <text
              x={cx}
              y={(p.y0 + p.y1) / 2 + 5}
              textAnchor="middle"
              fontSize={14}
              fontWeight={700}
              fill="var(--text)"
            >
              {num(p.count)}
            </text>

            {/* Right gutter: what this step cost, which is the point of the view. */}
            {p.i > 0 && p.dropFromPrev > 0 && (
              <text
                x={VIEW_W - GUTTER + 14}
                y={(p.y0 + p.y1) / 2 + 4}
                fontSize={11}
                fontWeight={600}
                fill={p.color}
              >
                −{p.dropFromPrev}%
              </text>
            )}
          </g>
        ))}
      </svg>
    </div>
  );
}
