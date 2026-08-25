import { useEffect, useMemo } from "react";
import { Card, Group, Text, Center, Loader, Stack, ThemeIcon } from "@mantine/core";
import { Inbox, Waypoints } from "lucide-react";
import {
  ReactFlow, Background, Controls, MarkerType, useNodesState,
  type Node, type Edge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useGetUserFlowQuery } from "@/app/store";
import { num } from "@/shared/lib";

/**
 * Lays nodes out left-to-right by BFS depth from whichever pages have no
 * incoming edge (the graph's entry points), so the picture reads the way a
 * visitor actually moves through the site.
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

  const positions = new Map<string, { x: number; y: number }>();
  const COL_W = 280;
  const ROW_H = 130;
  for (const [d, ids] of columns) {
    // Center each column vertically around the tallest one, so a page with
    // many branches doesn't push everything to one side.
    const colCount = ids.length;
    const maxCount = Math.max(...[...columns.values()].map((c) => c.length));
    const offset = ((maxCount - colCount) * ROW_H) / 2;
    ids.forEach((id, i) => {
      positions.set(id, { x: d * COL_W, y: offset + i * ROW_H });
    });
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

    const NODE_W = 200;
    const NODE_H = 54;

    const nodes: Node[] = rawNodes.map((n) => ({
      id: n.id,
      position: positions.get(n.id) ?? { x: 0, y: 0 },
      width: NODE_W,
      height: NODE_H,
      data: { label: `${n.id}\n${num(n.count)} visits` },
      style: {
        borderRadius: 10,
        border: "1.5px solid transparent",
        backgroundImage:
          "linear-gradient(rgba(255,255,255,0.04), rgba(255,255,255,0.04)), " +
          "linear-gradient(135deg, var(--mantine-color-emerald-6, #12b886), color-mix(in srgb, var(--mantine-color-emerald-6, #12b886) 30%, transparent))",
        backgroundOrigin: "border-box",
        backgroundClip: "padding-box, border-box",
        backgroundColor: "transparent",
        backdropFilter: "blur(6px)",
        padding: "6px 10px",
        fontSize: 12,
        lineHeight: 1.4,
        width: NODE_W,
        height: NODE_H,
        whiteSpace: "pre-line",
        textAlign: "left" as const,
        color: "var(--mantine-color-text, #e9ecef)",
      },
    }));

    const maxEdgeCount = Math.max(1, ...rawEdges.map((e) => e.count));
    const edges: Edge[] = rawEdges.map((e, i) => ({
      id: `e${i}-${e.source}-${e.target}`,
      source: e.source,
      target: e.target,
      type: "smoothstep",
      label: num(e.count),
      labelStyle: { fontSize: 11, fontWeight: 600 },
      animated: e.count / maxEdgeCount > 0.5,
      style: {
        stroke: "var(--border-strong, #5c5f66)",
        strokeWidth: 1.5,
      },
      markerEnd: { type: MarkerType.ArrowClosed, color: "var(--border-strong, #5c5f66)", width: 16, height: 16 },
    }));

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
        <Center py="xl"><Loader size="sm" /></Center>
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
            <Background gap={16} size={1} />
            <Controls showInteractive={false} position="bottom-right" />
          </ReactFlow>
        </div>
      )}
    </Card>
  );
}
