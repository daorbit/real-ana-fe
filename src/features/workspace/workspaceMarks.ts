const SUFFIXES = new Set(["inc", "llc", "ltd", "co", "corp", "gmbh", "plc", "pvt", "limited"]);

/** The letter for a workspace's logo tile: the first letter of its name. */
export function workspaceInitial(name: string): string {
  const first = name.trim().split(/\s+/).find((w) => !SUFFIXES.has(w.toLowerCase().replace(/[.,]/g, "")));
  return (first ?? name.trim() ?? "?").charAt(0).toUpperCase() || "?";
}

