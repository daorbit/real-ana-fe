import { useMemo } from "react";
import {
  ReactFlow, Background, Controls, MarkerType,
  type Node, type Edge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { num } from "@/shared/lib";
import type { FunnelResultStep } from "@/shared/types";

const NODE_W = 200;
const NODE_H = 60;
const COL_W = 260;

/** Color a step green-to-pink by how much it dropped from the previous one. */
function stepColor(dropFromPrev: number): string {
  if (dropFromPrev < 30) return "var(--mantine-color-emerald-6, #12b886)";
  if (dropFromPrev < 60) return "var(--mantine-color-amber-6, #f59f00)";
  return "var(--mantine-color-pink-6, #e64980)";
}

/** The funnel's steps drawn as a left-to-right node chain, sized by who's left. */
export function FunnelFlowView({ steps }: { steps: FunnelResultStep[] }) {
  const { nodes, edges } = useMemo(() => {
    const nodes: Node[] = steps.map((s, i) => ({
      id: `step-${i}`,
      position: { x: i * COL_W, y: 0 },
      width: NODE_W,
      height: NODE_H,
      data: {
        label: `${i + 1}. ${s.label}\n${num(s.count)} · ${s.rate}%`,
      },
      style: {
        borderRadius: 8,
        border: "1px solid var(--border-strong, #373a40)",
        borderLeft: `3px solid ${stepColor(s.dropFromPrev)}`,
        padding: "6px 10px",
        fontSize: 12,
        lineHeight: 1.4,
        width: NODE_W,
        height: NODE_H,
        background: "var(--surface, var(--mantine-color-body, #1a1b1e))",
        whiteSpace: "pre-line",
        textAlign: "left" as const,
      },
    }));

    const edges: Edge[] = steps.slice(1).map((s, i) => ({
      id: `e${i}`,
      source: `step-${i}`,
      target: `step-${i + 1}`,
      type: "smoothstep",
      label: s.dropFromPrev > 0 ? `-${s.dropFromPrev}%` : undefined,
      labelStyle: { fill: "var(--mantine-color-pink-6, #e64980)", fontSize: 11, fontWeight: 600 },
      style: {
        stroke: "var(--border-strong, #5c5f66)",
        strokeWidth: 1.5,
      },
      markerEnd: { type: MarkerType.ArrowClosed, color: "var(--border-strong, #5c5f66)", width: 16, height: 16 },
    }));

    return { nodes, edges };
  }, [steps]);

  return (
    <div style={{ height: 220, width: "100%", position: "relative" }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        minZoom={0.3}
        maxZoom={1.5}
        nodesDraggable
        nodesConnectable={false}
        edgesFocusable={false}
        proOptions={{ hideAttribution: true }}
      >
        <Background gap={16} size={1} />
        <Controls showInteractive={false} position="bottom-right" />
      </ReactFlow>
    </div>
  );
}
