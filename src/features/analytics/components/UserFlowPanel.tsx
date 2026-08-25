import { useEffect, useMemo } from "react";
import { Card, Group, Text, Center, Stack, ThemeIcon } from "@mantine/core";
import { Inbox, Waypoints } from "lucide-react";
import {
  ReactFlow, Background, BackgroundVariant, Controls, MarkerType, useNodesState,
  type Node, type Edge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useGetUserFlowQuery } from "@/app/store";
import { FlowGraphSkeleton } from "@/shared/ui/Skeletons";
import { FlowPageNode, type FlowPageNodeData } from "./FlowPageNode";

const NODE_W = 208;
/** Every node renders the same height now that paths are truncated to one
 * line, so rows can be laid out on a fixed pitch. */
const NODE_H = 84;
const COL_W = 300;
const ROW_GAP = 28;

const nodeTypes = { page: FlowPageNode };

/**
 * Lays nodes out left-to-right by BFS depth from whichever pages have no
 * incoming edge (the graph's entry points), so the picture reads the way a
 * visitor actually moves through the site. Each column is centred vertically
 * against the tallest one, so short columns do not hang off the top.
 */
function layout(nodeIds: string[], edges: { source: string; target: string }[]) {
  const incoming = new Set(edges.map((e) => e.target));
  const roots = nodeIds.filter((id) => !incoming.has(id));
  const starts = roots.length > 0 ? roots : nodeIds.slice(0, 1);

  const depth = new Map<string, number>();
  const queue: string[] = [];
  for (const r of starts) {
    depth.set(r, 0);
    queue.push(r);
  }
  const byId = new Map<string, string[]>();
  for (const e of edges) {
    if (!byId.has(e.source)) byId.set(e.source, []);
    byId.get(e.source)!.push(e.target);
  }
  while (queue.length) {
    const cur = queue.shift()!;
    const d = depth.get(cur)!;
    for (const next of byId.get(cur) ?? []) {
      if (!depth.has(next) || depth.get(next)! > d + 1) {
        depth.set(next, d + 1);
        queue.push(next);
      }
    }
  }
  // Anything unreached (isolated pages) gets pushed to its own column.
  let maxDepth = Math.max(0, ...depth.values());
  for (const id of nodeIds) {
    if (!depth.has(id)) depth.set(id, ++maxDepth);
  }

  const columns = new Map<number, string[]>();
  for (const id of nodeIds) {
    const d = depth.get(id)!;
    if (!columns.has(d)) columns.set(d, []);
    columns.get(d)!.push(id);
  }

  const tallest = Math.max(...[...columns.values()].map((ids) => ids.length));
  const positions = new Map<string, { x: number; y: number }>();
  for (const [d, ids] of columns) {
    const colHeight = ids.length * NODE_H + (ids.length - 1) * ROW_GAP;
    const fullHeight = tallest * NODE_H + (tallest - 1) * ROW_GAP;
    let y = (fullHeight - colHeight) / 2;
    for (const id of ids) {
      positions.set(id, { x: d * COL_W, y });
      y += NODE_H + ROW_GAP;
    }
  }
  return positions;
}

export function UserFlowPanel({
  workspaceId,
  range,
  sites,
}: {
  workspaceId: string;
  range: string;
  sites?: string[];
}) {
  const { data, isFetching } = useGetUserFlowQuery({ workspaceId, range, sites });

  const { nodes: initialNodes, edges } = useMemo(() => {
    const rawNodes = data?.nodes ?? [];
    const rawEdges = data?.edges ?? [];
    if (rawNodes.length === 0) return { nodes: [] as Node[], edges: [] as Edge[] };

    const positions = layout(rawNodes.map((n) => n.id), rawEdges);
    const hasIncoming = new Set(rawEdges.map((e) => e.target));
    const hasOutgoing = new Set(rawEdges.map((e) => e.source));
    const maxCount = Math.max(1, ...rawNodes.map((n) => n.count));

    const nodes: Node[] = rawNodes.map((n) => ({
      id: n.id,
      type: "page",
      position: positions.get(n.id) ?? { x: 0, y: 0 },
      width: NODE_W,
      height: NODE_H,
      data: {
        path: n.id,
        count: n.count,
        weight: n.count / maxCount,
        isEntry: !hasIncoming.has(n.id),
        isExit: !hasOutgoing.has(n.id),
      } satisfies FlowPageNodeData,
    }));

    const maxEdgeCount = Math.max(1, ...rawEdges.map((e) => e.count));
    const edges: Edge[] = rawEdges.map((e, i) => {
      const share = e.count / maxEdgeCount;
      // Heavier paths draw heavier, so the dominant route through the site is
      // visible before any label is read.
      const stroke = share > 0.6 ? "var(--accent-2)" : "var(--border-strong)";
      return {
        id: `e${i}-${e.source}-${e.target}`,
        source: e.source,
        target: e.target,
        type: "smoothstep",
        pathOptions: { borderRadius: 14 },
        label: String(e.count),
        labelShowBg: true,
        labelBgPadding: [6, 3] as [number, number],
        labelBgBorderRadius: 999,
        labelBgStyle: { fill: "var(--surface)", stroke: "var(--border)" },
        className: "flow-edge",
        labelStyle: { fill: "var(--text-2)", fontSize: 10, fontWeight: 600 },
        animated: share > 0.6,
        style: { stroke, strokeWidth: 1 + share * 1.6 },
        markerEnd: { type: MarkerType.ArrowClosed, color: stroke, width: 14, height: 14 },
      };
    });

    return { nodes, edges };
  }, [data]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);

  // New flow data (range/site change) -> replace the node set with its layout.
  useEffect(() => setNodes(initialNodes), [initialNodes, setNodes]);

  return (
    <Card withBorder radius="lg" padding="lg">
      <Group gap={8} mb="md">
        <Waypoints size={15} className="sect-ic" />
        <Text fw={600} c="dimmed" size="sm">User flow</Text>
      </Group>

      {isFetching ? (
        <FlowGraphSkeleton height={600} />
      ) : nodes.length === 0 ? (
        <Center py="lg">
          <Stack align="center" gap="xs" maw={380}>
            <ThemeIcon variant="light" color="gray" size="md" radius="md">
              <Inbox size={16} />
            </ThemeIcon>
            <Text c="dimmed" size="xs" ta="center">
              Waiting for enough sessions to draw a navigation graph.
            </Text>
          </Stack>
        </Center>
      ) : (
        <div style={{ height: 600, width: "100%", position: "relative" }}>
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
      )}
    </Card>
  );
}
