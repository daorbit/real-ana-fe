/** Hardcoded robot avatars a workspace's mark is picked from — one fixed set
 *  of assets, no per-visit regeneration. */
const WORKSPACE_BOTS = [
  "nova", "titan", "vector", "circuit", "byte", "volt", "axiom", "pixel",
  "echo", "fusion", "cortex", "photon", "turbo", "nimbus", "quark", "relay",
  "spark", "zenith", "helix", "beacon",
].map((seed) => `/avatars/workspace-bots/${seed}.svg`);

/**
 * Which bot each workspace in the list gets — stable per id and, unlike a
 * plain per-item hash, guaranteed not to repeat within one list. Two
 * workspaces landing on the same mark made them indistinguishable in the
 * menu, which defeated the point of having one at all.
 */
export function marksFor(workspaces: { _id: string }[]): Map<string, string> {
  const hash = (s: string) => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);
  const order = [...workspaces].sort((a, b) => hash(a._id) - hash(b._id));
  return new Map(order.map((w, i) => [w._id, WORKSPACE_BOTS[i % WORKSPACE_BOTS.length]]));
}
