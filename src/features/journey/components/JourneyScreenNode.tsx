import { memo, type CSSProperties } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";

export interface JourneyScreenNodeData extends Record<string, unknown> {
  /** The screen/page name this node stands for. */
  label: string;
  /** How many times the user landed here across the whole journey. */
  visits: number;
  /** First screen of the journey — where the session began. */
  isEntry: boolean;
  /** Last screen of the journey — where they currently are. */
  isExit: boolean;
}

/**
 * One screen in a user's journey graph.
 *
 * Deliberately built on the same `.flow-node` shell as the funnel and
 * user-flow nodes: a journey, a funnel and a flow are three readings of the
 * same underlying events, so they should look like the same kind of picture
 * rather than three unrelated diagrams.
 */
export const JourneyScreenNode = memo(function JourneyScreenNode({
  data,
  selected,
}: NodeProps & { data: JourneyScreenNodeData }) {
  const { label, visits, isEntry, isExit } = data;
  const color = isEntry ? "var(--accent-2)" : isExit ? "var(--pink)" : "var(--green)";

  return (
    <div
      className="flow-node"
      data-selected={selected || undefined}
      data-live={isExit && !isEntry ? "" : undefined}
      style={{ "--flow-rail": color } as CSSProperties}
    >
      <Handle type="target" position={Position.Left} className="flow-node-handle" />

      <div className="flow-node-head">
        <span className="flow-node-path" title={label}>{label}</span>
        {isEntry && <span className="flow-node-tag" data-kind="entry">start</span>}
        {isExit && !isEntry && <span className="flow-node-tag" data-kind="exit">latest</span>}
      </div>

      <div className="flow-node-metrics">
        <span className="flow-node-count">{visits}</span>
        <span className="flow-node-unit">{visits === 1 ? "visit" : "visits"}</span>
      </div>

      <Handle type="source" position={Position.Right} className="flow-node-handle" />
    </div>
  );
});
