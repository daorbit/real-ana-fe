import { Box } from "@mantine/core";
import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react";

/**
 * A radial gauge drawn as an SVG ring — the report's focal figure, and, at a
 * smaller size, the severity donut's ring. Progress is a single arc that fills
 * from the top.
 */
export function Gauge({
  value,
  size = 150,
  thickness = 11,
  color = "var(--mantine-color-emerald-6)",
  children,
}: {
  value: number;
  size?: number;
  thickness?: number;
  color?: string;
  children: React.ReactNode;
}) {
  const r = (size - thickness) / 2;
  const circ = 2 * Math.PI * r;
  const off = circ * (1 - Math.max(0, Math.min(100, value)) / 100);
  return (
    <Box className="seo-gauge" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--surface-2)" strokeWidth={thickness} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={thickness}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={off}
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />
      </svg>
      <div>{children}</div>
    </Box>
  );
}

/** The verdict glyph that sits under the overall gauge. */
export function ScoreBadgeInline({ score }: { score: number }) {
  const Icon = score >= 90 ? CheckCircle2 : score >= 50 ? AlertTriangle : XCircle;
  return <Icon size={12} />;
}
