const WORKSPACE_COLORS = [
  "#8b5cf6", "#3b82f6", "#10b981", "#f59e0b", "#f43f5e", "#06b6d4",
  "#f97316", "#6366f1", "#14b8a6", "#ec4899", "#84cc16", "#a855f7",
];

export function marksFor(workspaces: { _id: string }[]): Map<string, string> {
  const hash = (s: string) => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);
  const order = [...workspaces].sort((a, b) => hash(a._id) - hash(b._id));
  return new Map(order.map((w, i) => [w._id, WORKSPACE_COLORS[i % WORKSPACE_COLORS.length]]));
}
