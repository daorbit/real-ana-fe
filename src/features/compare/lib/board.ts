import type { SeoCompetitorComparison, SeoCompetitorGap } from "@/shared/types";

export type BoardRow =
  | { kind: "you"; rank: number; score: number }
  | { kind: "rival"; rank: number | null; comparison: SeoCompetitorComparison };

export type Tone = "ahead" | "behind" | "level" | "unread";

function rowScore(row: BoardRow): number {
  return row.kind === "you" ? row.score : row.comparison.snapshot.score;
}

export function buildBoard(competitors: SeoCompetitorComparison[], myScore: number): BoardRow[] {
  const readable = competitors.filter((c) => !c.readIssue);
  const unread = competitors.filter((c) => c.readIssue);
  const scores = [myScore, ...readable.map((c) => c.snapshot.score)];
  const rankOf = (score: number) => scores.filter((s) => s > score).length + 1;

  const you: BoardRow = { kind: "you", rank: rankOf(myScore), score: myScore };
  const ranked: BoardRow[] = [
    you,
    ...readable.map((c): BoardRow => ({ kind: "rival", rank: rankOf(c.snapshot.score), comparison: c })),
  ].sort((a, b) => rowScore(b) - rowScore(a) || Number(b.kind === "you") - Number(a.kind === "you"));

  return [...ranked, ...unread.map((c): BoardRow => ({ kind: "rival", rank: null, comparison: c }))];
}

export function toneOf(c: SeoCompetitorComparison): Tone {
  if (c.readIssue) return "unread";
  if (c.gap.scoreGap > 0) return "ahead";
  if (c.gap.scoreGap < 0) return "behind";
  return "level";
}

export function standingText(c: SeoCompetitorComparison): string {
  if (c.readIssue) return c.readIssue === "blocked" ? "Blocked our crawler" : `HTTP ${c.snapshot.statusCode}`;
  const gap = c.gap.scoreGap;
  if (gap > 0) return `${gap} ahead of you`;
  if (gap < 0) return `${Math.abs(gap)} behind you`;
  return "Level with you";
}

export function gapItemCount(gap: SeoCompetitorGap): number {
  return gap.contentGaps.length + gap.missingSchemaTypes.length + gap.missingKeywords.length;
}

export function points(n: number): string {
  return `${n} ${n === 1 ? "point" : "points"}`;
}

export function ordinal(n: number): string {
  const tens = n % 100;
  if (tens >= 11 && tens <= 13) return `${n}th`;
  switch (n % 10) {
    case 1:
      return `${n}st`;
    case 2:
      return `${n}nd`;
    case 3:
      return `${n}rd`;
    default:
      return `${n}th`;
  }
}
