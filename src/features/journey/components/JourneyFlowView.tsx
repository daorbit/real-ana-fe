import { useEffect, useMemo } from "react";
import {
  ReactFlow, Background, BackgroundVariant, Controls, MarkerType, useNodesState,
  type Node, type Edge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import type { JourneyStep } from "@/features/journey/lib/deriveJourney";
import { JourneyScreenNode, type JourneyScreenNodeData } from "./JourneyScreenNode";

const NODE_W = 208;
const NODE_H = 84;
const COL_W = 300;
const ROW_H = 150;

const nodeTypes = { screen: JourneyScreenNode };

/** A step's screen names, with the empty string standing in as "direct". */
function endpoints(e: JourneyStep): { from: string; to: string } {
  return { from: e.src || "(direct)", to: e.dest || e.action };
}

/**
 * The journey as a graph: one node per distinct screen, one edge per move
 * between two screens, labelled with the action that caused it.
 *
 * Repeated visits collapse into a single node rather than repeating it down
 * the page — that is the whole point of the graph reading: it shows the
 * *shape* of how someone moves through the product (loops, dead ends,
 * back-and-forth) which a flat list of thirty rows cannot.
 */
export function JourneyFlowView({ steps: events }: { steps: JourneyStep[] }) {
  const { nodes: initialNodes, edges } = useMemo(() => {
    // Distinct screens, in order of first appearance — that ordering is what
    // makes the left-to-right layout follow the actual journey.
    const order: string[] = [];
    const visits = new Map<string, number>();

    for (const e of events) {
      const { from, to } = endpoints(e);
      for (const name of [from, to]) {
        if (!order.includes(name)) order.push(name);
      }
      visits.set(to, (visits.get(to) ?? 0) + 1);
      if (!visits.has(from)) visits.set(from, 0);
    }

    const first = events.length ? endpoints(events[0]).from : "";
    const last = events.length ? endpoints(events[events.length - 1]).to : "";

    // Wrapped into rows so a long journey stays readable instead of running
    // off the canvas in one very wide line.
    const perRow = Math.max(3, Math.ceil(Math.sqrt(order.length)));

    const nodes: Node[] = order.map((name, i) => ({
      id: name,
      type: "screen",
      position: { x: (i % perRow) * COL_W, y: Math.floor(i / perRow) * ROW_H },
      width: NODE_W,
      height: NODE_H,
      data: {
        label: name,
        visits: visits.get(name) ?? 0,
        isEntry: name === first,
        isExit: name === last,
      } satisfies JourneyScreenNodeData,
    }));

    // One edge per distinct src->dest pair. Repeats become a count on the
    // label rather than parallel lines nobody can tell apart.
    const seen = new Map<string, { from: string; to: string; actions: Set<string>; count: number }>();
    for (const e of events) {
      const { from, to } = endpoints(e);
      if (from === to) continue; // a self-loop adds noise, not information
      const key = `${from}->${to}`;
      const hit = seen.get(key) ?? { from, to, actions: new Set<string>(), count: 0 };
      hit.actions.add(e.action);
      hit.count += 1;
      seen.set(key, hit);
    }

    const edges: Edge[] = [...seen.values()].map((hit, i) => {
      const label = [...hit.actions].slice(0, 2).join(", ") +
        (hit.actions.size > 2 ? ` +${hit.actions.size - 2}` : "") +
        (hit.count > 1 ? ` (${hit.count}x)` : "");
      return {
        id: `e${i}`,
        source: hit.from,
        target: hit.to,
        type: "smoothstep",
        pathOptions: { borderRadius: 14 },
        label,
        labelShowBg: true,
        labelBgPadding: [6, 3] as [number, number],
        labelBgBorderRadius: 999,
        labelBgStyle: { fill: "var(--surface)", stroke: "var(--border)" },
        labelStyle: { fill: "var(--text-2)", fontSize: 10, fontWeight: 600 },
        style: { stroke: "var(--border-strong)", strokeWidth: 1.4 },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: "var(--border-strong)",
          width: 14,
          height: 14,
        },
      };
    });

    return { nodes, edges };
  }, [events]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);

  useEffect(() => setNodes(initialNodes), [initialNodes, setNodes]);

  return (
    <div style={{ height: 460, width: "100%", position: "relative" }}>
      <ReactFlow
        nodes={nodes}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        edges={edges}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.2}
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
