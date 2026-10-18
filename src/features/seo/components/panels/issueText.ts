import { SEVERITY } from "@/features/seo/components/shared/Panel";

export type IssueSeverity = "critical" | "warning" | "info";

export type IssueRow = {
  severity: IssueSeverity;
  source: string;
  title: string;
  detail: string;
  url?: string;
};

/**
 * One issue as plain text, for pasting into a ticket or a message.
 *
 * Severity and source lead the line because they are what someone triaging the
 * paste reads first; the URL trails on its own line so it stays clickable in
 * clients that linkify.
 */
export function issueText(row: IssueRow): string {
  const head = `[${SEVERITY[row.severity].label} · ${row.source}] ${row.title}`;
  return [head, row.detail, row.url].filter(Boolean).join("\n");
}

/** The visible list as one block, numbered to match what is on screen. */
export function listText(rows: IssueRow[], heading: string): string {
  return [heading, "", ...rows.map((r, i) => `${i + 1}. ${issueText(r)}`)].join("\n");
}
