import { memo, type CSSProperties } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import type { LucideIcon } from "lucide-react";

/** What a node stands for in the pipeline, which decides its rail colour and
 *  which handles it grows. */
export type ReportNodeKind =
  | "trigger" | "scope" | "section" | "document" | "channel" | "recipient" | "empty";

export interface ReportFlowNodeData extends Record<string, unknown> {
  kind: ReportNodeKind;
  Icon: LucideIcon;
  /** Small uppercase line above the title — the node's role. */
  kicker: string;
  title: string;
  /** Optional second line: the site list, a recipient count, a warning. */
  detail?: string;
  /** Renders in the accent colour with a live dot: used for the trigger while
   *  the schedule is active, so "paused" is visible at a glance. */
  live?: boolean;
  /** A problem with this step — no channel selected, no recipients. Paints the
   *  node red rather than only failing on save. */
  warn?: boolean;
  /** This node's own colour, from REPORT_FLOW_HUES. Every node in the graph
   *  gets a distinct one so a node and the edge leaving it can be matched by
   *  eye — with one colour per kind, four content branches were the same
   *  green and told apart only by reading them. */
  hue: string;
  /** Form step this node stands for, opened when the node is clicked. Nodes
   *  with no step behind them (the empty-state ones) leave it unset and are
   *  not presented as clickable. */
  tab?: string;
}

/**
 * One step of a report schedule drawn as a pipeline node.
 *
 * Shares the `.flow-node` shell with the journey and funnel graphs — a report
 * is another directed pipeline over the same data, so it should read as the
 * same kind of picture rather than a second, unrelated diagram language.
 */
export const ReportFlowNode = memo(function ReportFlowNode({
  data,
  selected,
}: NodeProps & { data: ReportFlowNodeData }) {
  const { kind, Icon, kicker, title, detail, live, warn, hue, tab } = data;
  const rail = warn ? "var(--amber)" : hue;

  return (
    <div
      className="flow-node report-flow-node"
      data-selected={selected || undefined}
      data-kind={kind}
      data-warn={warn || undefined}
      // The click itself is handled once on the canvas (`onNodeClick`), which
      // already has the navigate callback — this only says the node leads
      // somewhere, so the cursor and title match what clicking does.
      data-clickable={tab ? "" : undefined}
      style={{ "--flow-rail": rail } as CSSProperties}
    >
      {/* The trigger starts the pipeline and the recipients end it, so neither
          grows the handle it would never use — a dangling handle reads as a
          missing connection. */}
      {kind !== "trigger" && (
        <Handle type="target" position={Position.Top} className="flow-node-handle" />
      )}

      <div className="flow-node-head">
        <span className="report-flow-ic" aria-hidden><Icon size={13} /></span>
        <span className="flow-node-path" title={title}>{title}</span>
        {live && <span className="report-flow-live" aria-hidden />}
      </div>

      <div className="report-flow-kicker">{kicker}</div>
      {detail && <div className="report-flow-detail" title={detail}>{detail}</div>}

      {kind !== "recipient" && kind !== "empty" && (
        <Handle type="source" position={Position.Bottom} className="flow-node-handle" />
      )}
    </div>
  );
});
