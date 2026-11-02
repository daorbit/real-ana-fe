import { useMemo, useState } from "react";
import { Anchor, Button, CopyButton, Stack } from "@mantine/core";
import { Check, CircleCheck, Copy, Search } from "lucide-react";
import type { SeoReportData } from "@/shared/types";
import { SEVERITY } from "@/features/seo/components/shared/Panel";
import { Pill, SeverityIcon } from "@/features/seo/components/shared/Pill";
import {
  Disclosure, DisclosureActions, DisclosureText, ListEmpty, ListHead, SeoList,
} from "@/features/seo/components/shared/SeoList";
import { severityTone } from "@/features/seo/components/shared/tone";
import { AskOrbitButton } from "@/features/orbit/components/AskOrbitButton";
import { EmptyState } from "@/shared/ui/EmptyState";
import {
  issueText, listText, sourceLabel, type IssueRow as Row, type IssueSeverity as Severity,
} from "./issueText";
import classes from "./IssuesPanel.module.css";

const ORDER: Record<Severity, number> = { critical: 0, warning: 1, info: 2 };

type Filter = "all" | Severity;

export function collectIssues(data: SeoReportData): Row[] {
  const rows: Row[] = [];

  for (const issue of data.issues) {
    rows.push({
      severity: issue.severity,
      source: issue.area,
      title: issue.title,
      detail: issue.detail,
    });
  }

  // Link checker. Only the failures — an OK link is not an issue, and the
  // Links tab already lists the full set.
  for (const link of data.links?.results ?? []) {
    if (link.status === "ok" || link.status === "skipped" || link.status === "blocked") continue;
    const title =
      link.status === "broken"
        ? "Broken link"
        : link.status === "server-error"
        ? "Link returns a server error"
        : link.status === "timeout"
        ? "Link timed out"
        : "Link redirects";
    rows.push({
      // A redirect still resolves, so it is a note, not a failure.
      severity:
        link.status === "redirect" ? "info" : link.status === "timeout" ? "warning" : "critical",
      source: "links",
      title,
      detail: [
        link.text ? `"${link.text}"` : null,
        link.statusCode ? `HTTP ${link.statusCode}` : null,
        link.internal ? "internal" : "external",
        link.note,
      ]
        .filter(Boolean)
        .join(" · "),
      url: link.url,
    });
  }

  for (const finding of data.schema?.findings ?? []) {
    rows.push({
      severity: finding.severity === "error" ? "critical" : "warning",
      source: "schema",
      title: `${finding.type}${finding.property ? ` · ${finding.property}` : ""}`,
      detail: finding.message,
    });
  }

  for (const finding of data.siteFiles?.robotsReport?.findings ?? []) {
    rows.push({
      severity: finding.severity,
      source: "robots.txt",
      title: finding.line ? `robots.txt line ${finding.line}` : "robots.txt",
      detail: finding.message,
    });
  }

  for (const finding of data.siteFiles?.sitemapReport?.findings ?? []) {
    rows.push({
      severity: finding.severity,
      source: "sitemap",
      title: "Sitemap",
      detail: finding.message,
    });
  }

  for (const finding of data.aiSearch?.findings ?? []) {
    rows.push({
      severity: finding.severity,
      source: "ai",
      title: "AI search",
      detail: finding.message,
    });
  }

  for (const s of data.performance?.suggestions ?? []) {
    rows.push({
      severity: s.score < 0.5 ? "warning" : "info",
      source: s.category || "performance",
      title: s.title,
      detail: [s.displayValue, s.description].filter(Boolean).join(" — "),
    });
  }

  return rows;
}

export function IssuesPanel({ data }: { data: SeoReportData }) {
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");

  const all = useMemo(() => collectIssues(data), [data]);

  const counts = useMemo(
    () => ({
      all: all.length,
      critical: all.filter((i) => i.severity === "critical").length,
      warning: all.filter((i) => i.severity === "warning").length,
      info: all.filter((i) => i.severity === "info").length,
    }),
    [all]
  );

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = all
      .filter((i) => filter === "all" || i.severity === filter)
      .filter((i) => !q || `${i.title} ${i.detail} ${sourceLabel(i.source)}`.toLowerCase().includes(q));
    return [...list].sort((a, b) => ORDER[a.severity] - ORDER[b.severity]);
  }, [all, filter, query]);

  const copyHeading = `SEO issues — ${data.finalUrl}${
    filter === "all" ? "" : ` (${SEVERITY[filter].label.toLowerCase()} only)`
  } — ${rows.length} of ${all.length}`;

  if (!all.length) {
    return (
      <EmptyState
        compact
        icon={CircleCheck}
        title="No issues found"
        description="Every check this audit runs came back clean."
      />
    );
  }

  const filters: { id: Filter; label: string; n: number }[] = [
    { id: "all", label: "All", n: counts.all },
    { id: "critical", label: "Critical", n: counts.critical },
    { id: "warning", label: "Warnings", n: counts.warning },
    { id: "info", label: "Suggestions", n: counts.info },
  ];

  return (
    <Stack gap="md">
      <div className={classes.toolbar}>
        <div className={`seo-segment ${classes.filter}`} role="group" aria-label="Filter by severity">
          {filters.map((f) => (
            <button
              key={f.id}
              type="button"
              data-active={filter === f.id || undefined}
              aria-pressed={filter === f.id}
              onClick={() => setFilter(f.id)}
            >
              {f.label}
              <span className={classes.count}>{f.n}</span>
            </button>
          ))}
        </div>
        <span className={classes.spacer} />
        <label className={classes.search}>
          <Search size={14} aria-hidden />
          <input
            type="search"
            className={classes.searchInput}
            placeholder="Search issues"
            aria-label="Search issues"
            value={query}
            onChange={(e) => setQuery(e.currentTarget.value)}
          />
        </label>
        <CopyButton value={listText(rows, copyHeading)}>
          {({ copied, copy }) => (
            <Button
              size="xs"
              variant="default"
              onClick={copy}
              disabled={!rows.length}
              leftSection={copied ? <Check size={14} /> : <Copy size={14} />}
            >
              {copied ? "Copied" : "Copy all"}
            </Button>
          )}
        </CopyButton>
      </div>

      <SeoList>
        <ListHead>
          <span className={classes.colLead} />
          <span className={classes.colIssue}>Issue</span>
          <span className={classes.colSource}>Source</span>
          <span className={classes.colSeverity}>Severity</span>
          <span className={classes.colChevron} />
        </ListHead>
        {rows.length ? (
          rows.map((row, i) => (
            <Disclosure
              key={`${row.source}-${row.title}-${i}`}
              lead={<SeverityIcon severity={row.severity} />}
              title={row.title}
              sub={row.detail}
              aside={
                <>
                  <span className={classes.colSource}>
                    <Pill>{sourceLabel(row.source)}</Pill>
                  </span>
                  <span className={classes.colSeverity}>
                    <Pill tone={severityTone(row.severity)}>{SEVERITY[row.severity].label}</Pill>
                  </span>
                </>
              }
            >
              {row.detail && <DisclosureText label="Details">{row.detail}</DisclosureText>}
              {row.url && (
                <Anchor href={row.url} target="_blank" rel="noopener noreferrer" className={classes.url}>
                  {row.url}
                </Anchor>
              )}
              <DisclosureActions>
                <AskOrbitButton
                  size="xs"
                  label="Ask Orbit how to fix it"
                  question={`My SEO audit flagged: "${row.title}". ${row.detail} How do I fix this?`}
                />
                <CopyButton value={issueText(row)}>
                  {({ copied, copy }) => (
                    <Button
                      size="xs"
                      variant="default"
                      onClick={copy}
                      leftSection={copied ? <Check size={13} /> : <Copy size={13} />}
                    >
                      {copied ? "Copied" : "Copy"}
                    </Button>
                  )}
                </CopyButton>
              </DisclosureActions>
            </Disclosure>
          ))
        ) : (
          <ListEmpty>Nothing matches this filter.</ListEmpty>
        )}
      </SeoList>
    </Stack>
  );
}
