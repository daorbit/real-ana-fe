import { useMemo } from "react";
import { num } from "@/shared/lib";
import type { FunnelResultStep } from "@/shared/types";

const COLORS = [
  "var(--mantine-color-blue-6, #228be6)",
  "var(--mantine-color-teal-6, #12b886)",
  "var(--mantine-color-orange-6, #fd7e14)",
  "var(--mantine-color-grape-6, #be4bdb)",
  "var(--mantine-color-indigo-6, #4c6ef5)",
  "var(--mantine-color-pink-6, #e64980)",
  "var(--mantine-color-cyan-6, #15aabf)",
  "var(--mantine-color-lime-6, #82c91e)",
];

const VIEW_W = 640;
const ROW_H = 64;
const MIN_WIDTH_PCT = 0.06;

/** Each step as a trapezoid whose width tracks its share of the top step,
 * stacked top to bottom — the funnel shape people actually recognize, as
 * opposed to the flow-graph or list views. */
export function FunnelShapeView({ steps }: { steps: FunnelResultStep[] }) {
  const rows = useMemo(() => {
    const top = steps[0]?.count || 1;
    return steps.map((s, i) => {
      const widthFrac = Math.max(MIN_WIDTH_PCT, s.count / top);
      return { ...s, i, widthFrac, color: COLORS[i % COLORS.length] };
    });
  }, [steps]);

  const height = rows.length * ROW_H;

  const polygons = rows.map((row, i) => {
    const next = rows[i + 1];
    const topHalf = (row.widthFrac * VIEW_W) / 2;
    const botHalf = ((next ? next.widthFrac : row.widthFrac) * VIEW_W) / 2;
    const cx = VIEW_W / 2;
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
    return { ...row, points, y0, y1 };
  });

  return (
    <div style={{ width: "100%", overflowX: "auto" }}>
      <Legend rows={rows} />
      <svg viewBox={`0 0 ${VIEW_W} ${height}`} width="100%" height={height} role="img">
        {polygons.map((p) => (
          <polygon key={p.i} points={p.points} fill={p.color} opacity={0.88} />
        ))}
        {polygons.map((p) => (
          <text
            key={`t-${p.i}`}
            x={VIEW_W / 2}
            y={(p.y0 + p.y1) / 2 - 6}
            textAnchor="middle"
            fontSize={13}
            fontWeight={600}
            fill="var(--mantine-color-body, #fff)"
          >
            {p.label}
          </text>
        ))}
        {polygons.map((p) => (
          <text
            key={`c-${p.i}`}
            x={VIEW_W / 2}
            y={(p.y0 + p.y1) / 2 + 12}
            textAnchor="middle"
            fontSize={12}
            fill="var(--mantine-color-body, #fff)"
            opacity={0.9}
          >
            {num(p.count)}
          </text>
        ))}
      </svg>
    </div>
  );
}

function Legend({ rows }: { rows: { label: string; color: string }[] }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 8 }}>
      {rows.map((r, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span
            style={{
              width: 10,
              height: 10,
              borderRadius: 2,
              background: r.color,
              display: "inline-block",
            }}
          />
          <span style={{ fontSize: 12, color: "var(--mantine-color-dimmed)" }}>{r.label}</span>
        </div>
      ))}
    </div>
  );
}
