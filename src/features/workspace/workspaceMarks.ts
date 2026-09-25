const WORKSPACE_COLORS = [
  "#8b5cf6", "#3b82f6", "#10b981", "#f59e0b", "#f43f5e", "#06b6d4",
  "#f97316", "#6366f1", "#14b8a6", "#ec4899", "#84cc16", "#a855f7",
];

export function marksFor(workspaces: { _id: string }[]): Map<string, string> {
  const hash = (s: string) => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);
  const order = [...workspaces].sort((a, b) => hash(a._id) - hash(b._id));
  return new Map(order.map((w, i) => [w._id, WORKSPACE_COLORS[i % WORKSPACE_COLORS.length]]));
}

const SUFFIXES = new Set(["inc", "llc", "ltd", "co", "corp", "gmbh", "plc", "pvt", "limited"]);

/** Up to two letters for a workspace's monogram: the first letters of its
 *  first two words, or the first two letters of a one-word name. */
export function workspaceInitials(name: string): string {
  const all = name.trim().split(/\s+/).filter(Boolean);
  // "Acme Inc." is "AC", not "AI": a company suffix says nothing about which
  // workspace this is.
  const words = all.filter((w, i) => i === 0 || !SUFFIXES.has(w.toLowerCase().replace(/[.,]/g, "")));
  if (!words.length) return "?";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}
