import type { FlowEdge, FlowNode } from "@/shared/types";

export type FlowColumnNode = { path: string; sessions: number; leavePct: number; share: number };

export type FlowColumn = { title: string; continuePct: number | null; nodes: FlowColumnNode[] };

const TITLES = ["First page", "Second page", "Third page"];

export function flowColumns(nodes: FlowNode[], edges: FlowEdge[], perColumn = 3): FlowColumn[] {
  if (!nodes.length) return [];
  const totals = new Map(nodes.map((n) => [n.id, n.count]));
  const outgoing = new Map<string, number>();
  const bySource = new Map<string, FlowEdge[]>();
  for (const e of edges) {
    outgoing.set(e.source, (outgoing.get(e.source) ?? 0) + e.count);
    bySource.set(e.source, [...(bySource.get(e.source) ?? []), e]);
  }

  const leaveOf = (path: string) => {
    const total = totals.get(path) ?? 0;
    if (!total) return 0;
    return Math.max(0, Math.min(100, Math.round((1 - (outgoing.get(path) ?? 0) / total) * 100)));
  };

  const incoming = new Set(edges.map((e) => e.target));
  const entries = nodes.filter((n) => !incoming.has(n.id));
  const firstPool = (entries.length ? entries : nodes).map((n) => ({ path: n.id, sessions: n.count }));

  const steps: { path: string; sessions: number }[][] = [
    [...firstPool].sort((a, b) => b.sessions - a.sessions).slice(0, perColumn),
  ];

  while (steps.length < TITLES.length) {
    const reached = new Map<string, number>();
    for (const node of steps[steps.length - 1]) {
      for (const e of bySource.get(node.path) ?? []) {
        reached.set(e.target, (reached.get(e.target) ?? 0) + e.count);
      }
    }
    if (!reached.size) break;
    steps.push(
      [...reached]
        .map(([path, sessions]) => ({ path, sessions }))
        .sort((a, b) => b.sessions - a.sessions)
        .slice(0, perColumn),
    );
  }

  return steps.map((step, i) => {
    const top = Math.max(1, ...step.map((s) => s.sessions));
    const moved = step.reduce((sum, s) => sum + (outgoing.get(s.path) ?? 0), 0);
    const seen = step.reduce((sum, s) => sum + (totals.get(s.path) ?? s.sessions), 0);
    return {
      title: TITLES[i],
      continuePct: i < steps.length - 1 && seen > 0 ? Math.min(100, Math.round((moved / seen) * 100)) : null,
      nodes: step.map((s) => ({
        path: s.path,
        sessions: s.sessions,
        leavePct: leaveOf(s.path),
        share: (s.sessions / top) * 100,
      })),
    };
  });
}
