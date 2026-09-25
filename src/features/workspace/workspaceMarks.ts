const SUFFIXES = new Set(["inc", "llc", "ltd", "co", "corp", "gmbh", "plc", "pvt", "limited"]);

/** The letter for a workspace's logo tile: the first letter of its name. */
export function workspaceInitial(name: string): string {
  const first = name.trim().split(/\s+/).find((w) => !SUFFIXES.has(w.toLowerCase().replace(/[.,]/g, "")));
  return (first ?? name.trim() ?? "?").charAt(0).toUpperCase() || "?";
}

/** Hues that make a clean gradient — the muddy yellow-greens are left out. */
const HUES = [212, 234, 258, 282, 318, 342, 8, 24, 166, 188];

/**
 * A stable hue for a workspace, from its name. Gives each workspace a colour
 * of its own on the workspaces page, so telling them apart is a glance.
 */
export function workspaceHue(name: string): number {
  let h = 0;
  for (const ch of name.trim().toLowerCase()) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return HUES[h % HUES.length];
}
