import { memo, type CSSProperties } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import type { LucideIcon } from "lucide-react";

/** What a node stands for in the pipeline, which decides its rail colour and
 *  which handles it grows. */
export type ReportNodeKind = "trigger" | "scope" | "section" | "channel" | "empty";

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
}

const RAIL: Record<ReportNodeKind, string> = {
  trigger: "var(--accent-2)",
  scope: "var(--cyan)",
  section: "var(--green)",
  channel: "var(--pink)",
  empty: "var(--border-strong)",
};

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
  const { kind, Icon, kicker, title, detail, live, warn } = data;
  const rail = warn ? "var(--amber)" : RAIL[kind];

  return (
    <div
      className="flow-node report-flow-node"
      data-selected={selected || undefined}
      data-kind={kind}
      data-warn={warn || undefined}
      style={{ "--flow-rail": rail } as CSSProperties}
    >
      {/* The trigger starts the pipeline and the channels end it, so neither
          grows the handle it would never use — a dangling handle reads as a
          missing connection. */}
      {kind !== "trigger" && (
        <Handle type="target" position={Position.Left} className="flow-node-handle" />
      )}

      <div className="flow-node-head">
        <span className="report-flow-ic" aria-hidden><Icon size={13} /></span>
        <span className="flow-node-path" title={title}>{title}</span>
        {live && <span className="report-flow-live" aria-hidden />}
      </div>

      <div className="report-flow-kicker">{kicker}</div>
      {detail && <div className="report-flow-detail" title={detail}>{detail}</div>}

      {kind !== "channel" && kind !== "empty" && (
        <Handle type="source" position={Position.Right} className="flow-node-handle" />
      )}
    </div>
  );
});
