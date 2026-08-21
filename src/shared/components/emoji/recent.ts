const KEY = "quantalog.emoji.recent";
const MAX = 16;

/** The emoji this browser has picked before, most recent first. */
export function readRecent(): string[] {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((e): e is string => typeof e === "string") : [];
  } catch {
    return [];
  }
}

export function pushRecent(emoji: string): string[] {
  const next = [emoji, ...readRecent().filter((e) => e !== emoji)].slice(0, MAX);
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // A browser with storage blocked still gets a working picker.
  }
  return next;
}
