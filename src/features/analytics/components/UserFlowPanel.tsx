import { useMemo } from "react";
import { Card, Group, Text, Center, Loader, Stack, ThemeIcon } from "@mantine/core";
import { Inbox, Waypoints } from "lucide-react";
import {
  ReactFlow, Background, Controls, MarkerType,
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
  const COL_W = 260;
  const ROW_H = 90;
  for (const [d, ids] of columns) {
    ids.forEach((id, i) => {
      positions.set(id, { x: d * COL_W, y: i * ROW_H });
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

  const { nodes, edges } = useMemo(() => {
    const rawNodes = data?.nodes ?? [];
    const rawEdges = data?.edges ?? [];
    if (rawNodes.length === 0) return { nodes: [] as Node[], edges: [] as Edge[] };

    const maxCount = Math.max(1, ...rawNodes.map((n) => n.count));
    const positions = layout(rawNodes.map((n) => n.id), rawEdges);

    const nodes: Node[] = rawNodes.map((n) => ({
      id: n.id,
      position: positions.get(n.id) ?? { x: 0, y: 0 },
      data: { label: `${n.id}\n${num(n.count)} visits` },
      style: {
        borderRadius: 10,
        border: "1px solid var(--mantine-color-emerald-6, #12b886)",
        padding: 8,
        fontSize: 12,
        width: 200,
        background: `color-mix(in srgb, var(--mantine-color-emerald-6, #12b886) ${Math.round(
          15 + (n.count / maxCount) * 35,
        )}%, var(--mantine-color-body, #fff))`,
        whiteSpace: "pre-line",
        textAlign: "left" as const,
      },
    }));

    const maxEdgeCount = Math.max(1, ...rawEdges.map((e) => e.count));
    const edges: Edge[] = rawEdges.map((e, i) => ({
      id: `e${i}-${e.source}-${e.target}`,
      source: e.source,
      target: e.target,
      label: num(e.count),
      animated: e.count / maxEdgeCount > 0.5,
      style: { strokeWidth: 1 + (e.count / maxEdgeCount) * 4 },
      markerEnd: { type: MarkerType.ArrowClosed },
    }));

    return { nodes, edges };
  }, [data]);

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
        <div style={{ height: 520 }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            fitView
            nodesDraggable
            nodesConnectable={false}
            edgesFocusable={false}
            proOptions={{ hideAttribution: true }}
          >
            <Background />
            <Controls showInteractive={false} />
          </ReactFlow>
        </div>
      )}
    </Card>
  );
}
