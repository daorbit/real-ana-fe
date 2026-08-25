import { memo, type CSSProperties } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { num } from "@/shared/lib";

export interface FunnelStepNodeData extends Record<string, unknown> {
  index: number;
  label: string;
  count: number;
  /** Share of the funnel's first step still present here, as a percentage. */
  rate: number;
  /** Drop from the previous step, as a percentage — 0 on the first step. */
  dropFromPrev: number;
}

/** Green while the step holds its traffic, amber then pink as it sheds it. */
function tone(dropFromPrev: number): string {
  if (dropFromPrev < 30) return "var(--green)";
  if (dropFromPrev < 60) return "var(--amber)";
  return "var(--pink)";
}

/**
 * One step of a funnel, drawn with the same shell as the user-flow nodes so a
 * funnel and a flow read as the same kind of picture. Handles are pinned
 * left/right to match the strictly left-to-right chain.
 */
export const FunnelStepNode = memo(function FunnelStepNode({
  data,
  selected,
}: NodeProps & { data: FunnelStepNodeData }) {
  const { index, label, count, rate, dropFromPrev } = data;
  const color = index === 0 ? "var(--accent-2)" : tone(dropFromPrev);

  return (
    <div className="flow-node" data-selected={selected || undefined} style={{ "--flow-rail": color } as CSSProperties}>
      <Handle type="target" position={Position.Left} className="flow-node-handle" />

      <div className="flow-node-head">
        <span className="flow-node-step">{index + 1}</span>
        <span className="flow-node-path" title={label}>
          {label}
        </span>
      </div>

      <div className="flow-node-metrics">
        <span className="flow-node-count">{num(count)}</span>
        <span className="flow-node-unit">{rate}% of entries</span>
      </div>

      {/* The bar is the step's own retention, so the funnel's shape is legible
          straight down the chain without comparing numbers. */}
      <div className="flow-node-bar">
        <div
          className="flow-node-bar-fill"
          style={{ width: `${Math.max(3, rate)}%`, background: color }}
        />
      </div>

      <Handle type="source" position={Position.Right} className="flow-node-handle" />
    </div>
  );
});
