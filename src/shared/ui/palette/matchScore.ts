function subsequence(text: string, q: string): boolean {
  let i = 0;
  for (const ch of text) {
    if (ch === q[i]) i++;
    if (i === q.length) return true;
  }
  return false;
}

export function matchScore(label: string, extra: string, query: string): number {
  const q = query.trim().toLowerCase();
  if (!q) return 1;
  const text = label.toLowerCase();
  if (text === q) return 100;
  if (text.startsWith(q)) return 80;
  if (text.split(/[\s:/-]+/).some((w) => w.startsWith(q))) return 60;
  if (text.includes(q)) return 40;
  if (extra.toLowerCase().includes(q)) return 20;
  if (q.length > 1 && subsequence(text, q)) return 10;
  return 0;
}
