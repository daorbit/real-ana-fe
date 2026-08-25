import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { num } from "@/shared/lib";

export interface FlowPageNodeData extends Record<string, unknown> {
  path: string;
  count: number;
  /** 0-1, this page's share of the busiest page — drives the traffic bar. */
  weight: number;
  isEntry: boolean;
  isExit: boolean;
}

/**
 * One page in the user-flow graph.
 *
 * Handles are pinned left/right because the layout is strictly left-to-right:
 * with React Flow's default top/bottom handles the edges leave the top of a
 * node and loop back down, which is what made the wiring unreadable.
 */
export const FlowPageNode = memo(function FlowPageNode({
  data,
  selected,
}: NodeProps & { data: FlowPageNodeData }) {
  const { path, count, weight, isEntry, isExit } = data;

  return (
    <div className="flow-node" data-selected={selected || undefined}>
      <Handle type="target" position={Position.Left} className="flow-node-handle" />

      <div className="flow-node-head">
        <span className="flow-node-path" title={path}>
          {path}
        </span>
        {isEntry ? (
          <span className="flow-node-tag" data-kind="entry">entry</span>
        ) : isExit ? (
          <span className="flow-node-tag" data-kind="exit">exit</span>
        ) : null}
      </div>

      <div className="flow-node-metrics">
        <span className="flow-node-count">{num(count)}</span>
        <span className="flow-node-unit">{count === 1 ? "visit" : "visits"}</span>
      </div>

      {/* Relative traffic, so the busy pages are findable without reading every
          number on the canvas. */}
      <div className="flow-node-bar">
        <div className="flow-node-bar-fill" style={{ width: `${Math.max(4, weight * 100)}%` }} />
      </div>

      <Handle type="source" position={Position.Right} className="flow-node-handle" />
    </div>
  );
});
