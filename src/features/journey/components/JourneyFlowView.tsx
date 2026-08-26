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
// Generous gaps: the edge labels sit at the midpoint between two nodes, so
// the column gap has to be wider than the widest label or the text lands on
// top of the boxes either side of it.
const COL_W = 380;
const ROW_H = 190;

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

    /**
     * Layered layout: a screen's column is how many steps it takes to first
     * reach it from the start, and its row is its position among the screens
     * that share that column.
     *
     * A plain grid (index % perRow) put screens next to each other for no
     * reason other than the order they happened to be discovered in, so
     * edges crossed the whole canvas and the picture read as noise. Laying
     * out by depth means an edge is usually one column long and points
     * rightwards, which is what makes a flow diagram legible.
     */
    const depth = new Map<string, number>();
    depth.set(first || order[0], 0);

    // Relaxed a few times rather than a full topological sort: journeys loop
    // back on themselves constantly, so there is no true ordering — this
    // settles quickly and keeps the common case (a mostly-forward path)
    // laid out the way someone would draw it by hand.
    for (let pass = 0; pass < 4; pass++) {
      for (const e of events) {
        const { from, to } = endpoints(e);
        const at = depth.get(from);
        if (at === undefined) continue;
        const existing = depth.get(to);
        if (existing === undefined || existing > at + 1) depth.set(to, at + 1);
      }
    }
    // Anything never reached from the start (a session that began elsewhere)
    // still needs a column.
    for (const name of order) if (!depth.has(name)) depth.set(name, 0);

    const rowCursor = new Map<number, number>();
    const nodes: Node[] = order.map((name) => {
      const col = depth.get(name) ?? 0;
      const row = rowCursor.get(col) ?? 0;
      rowCursor.set(col, row + 1);
      return {
        id: name,
        type: "screen",
        position: { x: col * COL_W, y: row * ROW_H },
        width: NODE_W,
        height: NODE_H,
        data: {
          label: name,
          visits: visits.get(name) ?? 0,
          isEntry: name === first,
          isExit: name === last,
        } satisfies JourneyScreenNodeData,
      };
    });

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

    // The busiest edge sets the scale, so line weight reads as "how often
    // this move happens" rather than every line looking the same.
    const busiest = Math.max(...[...seen.values()].map((h) => h.count), 1);

    const edges: Edge[] = [...seen.values()].map((hit, i) => {
      // One action name plus a count. Listing two or three names produced a
      // label wider than the gap between nodes, which is what was running
      // the text underneath the boxes.
      const [first] = [...hit.actions];
      const more = hit.actions.size - 1;
      const label =
        (first.length > 16 ? `${first.slice(0, 15)}…` : first) +
        (more > 0 ? ` +${more}` : "") +
        (hit.count > 1 ? ` ·${hit.count}` : "");

      const weight = hit.count / busiest;
      const stroke = weight > 0.66 ? "var(--accent-2)" : "var(--border-strong)";

      return {
        id: `e${i}`,
        source: hit.from,
        target: hit.to,
        type: "smoothstep",
        pathOptions: { borderRadius: 14 },
        // The dashes travel along the path, so direction is legible without
        // hunting for the arrowhead on a long line.
        animated: true,
        label,
        labelShowBg: true,
        labelBgPadding: [6, 3] as [number, number],
        labelBgBorderRadius: 999,
        labelBgStyle: { fill: "var(--surface)", stroke: "var(--border)" },
        labelStyle: { fill: "var(--text-2)", fontSize: 10, fontWeight: 600 },
        style: { stroke, strokeWidth: 1.2 + weight * 1.8 },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: stroke,
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
    <div style={{ height: "calc(100vh - 300px)", minHeight: 520, width: "100%", position: "relative" }}>
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
