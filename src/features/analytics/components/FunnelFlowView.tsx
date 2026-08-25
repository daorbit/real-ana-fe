import { useEffect, useMemo } from "react";
import {
  ReactFlow, Background, BackgroundVariant, Controls, MarkerType, useNodesState,
  type Node, type Edge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import type { FunnelResultStep } from "@/shared/types";
import { FunnelStepNode, type FunnelStepNodeData } from "./FunnelStepNode";

const NODE_W = 208;
const NODE_H = 84;
const COL_W = 300;

const nodeTypes = { step: FunnelStepNode };

/** Green while the step holds its traffic, amber then pink as it sheds it. */
function stepColor(dropFromPrev: number): string {
  if (dropFromPrev < 30) return "var(--green)";
  if (dropFromPrev < 60) return "var(--amber)";
  return "var(--pink)";
}

/** The funnel's steps drawn as a left-to-right node chain, sized by who's left. */
export function FunnelFlowView({ steps }: { steps: FunnelResultStep[] }) {
  const { nodes: initialNodes, edges } = useMemo(() => {
    const nodes: Node[] = steps.map((s, i) => ({
      id: `step-${i}`,
      type: "step",
      position: { x: i * COL_W, y: 0 },
      width: NODE_W,
      height: NODE_H,
      data: {
        index: i,
        label: s.label,
        count: s.count,
        rate: s.rate,
        dropFromPrev: s.dropFromPrev,
      } satisfies FunnelStepNodeData,
    }));

    const edges: Edge[] = steps.slice(1).map((s, i) => {
      // The edge carries the loss, so it is coloured by the drop it represents
      // rather than by the step it lands on.
      const stroke = s.dropFromPrev > 0 ? stepColor(s.dropFromPrev) : "var(--border-strong)";
      return {
        id: `e${i}`,
        source: `step-${i}`,
        target: `step-${i + 1}`,
        type: "smoothstep",
        pathOptions: { borderRadius: 14 },
        label: s.dropFromPrev > 0 ? `-${s.dropFromPrev}%` : undefined,
        labelShowBg: true,
        labelBgPadding: [6, 3] as [number, number],
        labelBgBorderRadius: 999,
        labelBgStyle: { fill: "var(--surface)", stroke: "var(--border)" },
        labelStyle: { fill: stroke, fontSize: 10, fontWeight: 600 },
        style: { stroke, strokeWidth: 1.4 },
        markerEnd: { type: MarkerType.ArrowClosed, color: stroke, width: 14, height: 14 },
      };
    });

    return { nodes, edges };
  }, [steps]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);

  // New funnel result -> replace the node set (new positions, new steps).
  useEffect(() => setNodes(initialNodes), [initialNodes, setNodes]);

  return (
    <div style={{ height: 220, width: "100%", position: "relative" }}>
      <ReactFlow
        nodes={nodes}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
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
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="var(--border)" />
        <Controls showInteractive={false} position="bottom-right" />
      </ReactFlow>
    </div>
  );
}
