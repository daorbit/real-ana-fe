import { useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { Box, Button, Center, Group, Loader, Text } from "@mantine/core";
import { Printer } from "lucide-react";
import { useGetSeoReportQuery } from "../store";
import { useWorkspace } from "../workspace";
import { dateTime } from "../utils";
import type { SeoIssue } from "../types";
import "./print.css";

/**
 * A client-ready SEO report, laid out for paper.
 *
 * Rendered as a page the browser prints rather than a PDF built on the server:
 * a real PDF would need headless Chromium, which is a ~300MB dependency that
 * will not run on the current serverless deploy. This gets the same artefact
 * out of Ctrl+P at a fraction of the cost, and can be swapped for server-side
 * rendering later without the UI changing.
 *
 * Deliberately outside the app shell — navigation, sidebars and theme toggles
 * have no place in something being handed to a client.
 */
export default function SeoReportPrint() {
  const { siteId = "", reportId = "" } = useParams();
  const [params] = useSearchParams();
  const { active } = useWorkspace();
  const workspaceId = active?._id ?? "";

  // White-label overrides, passed in the URL so a report can be branded
  // without storing per-agency settings server-side.
  const brand = params.get("brand")?.trim() || active?.name || "";
  const accent = params.get("accent")?.trim() || "#10b981";

  const { data: report, isLoading } = useGetSeoReportQuery(
    { workspaceId, siteId, reportId },
    { skip: !workspaceId || !siteId || !reportId }
  );

  // Opening the print dialog automatically would fight anyone who wants to
  // read the page first, so the button stays explicit.
  useEffect(() => {
    if (report) document.title = `SEO report — ${new URL(report.url).hostname}`;
  }, [report]);

  if (isLoading) {
    return (
      <Center h="60vh">
        <Loader size="sm" />
      </Center>
    );
  }

  if (!report?.data) {
    return (
      <Center h="60vh">
        <Text size="sm" c="dimmed">
          Report not found.
        </Text>
      </Center>
    );
  }

  const data = report.data;
  const critical = data.issues.filter((i) => i.severity === "critical");
  const warnings = data.issues.filter((i) => i.severity === "warning");
  const notes = data.issues.filter((i) => i.severity === "info");

  return (
    <Box className="print-root" style={{ "--accent": accent } as React.CSSProperties}>
      <Box className="print-toolbar no-print">
        <Group justify="space-between">
          <Text size="sm" c="dimmed">
            Print or save as PDF from your browser&apos;s dialog.
          </Text>
          <Button
            size="sm"
            radius="md"
            leftSection={<Printer size={15} />}
            onClick={() => window.print()}
            style={{ background: accent }}
          >
            Print / Save PDF
          </Button>
        </Group>
      </Box>

      <article className="print-page">
        <header className="print-header">
          <div>
            {brand && <p className="print-brand">{brand}</p>}
            <h1>SEO audit</h1>
            <p className="print-url">{data.finalUrl}</p>
          </div>
          <div className="print-score" data-band={band(data.score)}>
            <span className="print-score-value">{data.score}</span>
            <span className="print-score-label">/ 100</span>
          </div>
        </header>

        <p className="print-meta">Generated {dateTime(report.createdAt)}</p>

        <section className="print-section">
          <h2>Summary</h2>
          <div className="print-grid">
            <Metric label="Overall" value={String(data.score)} />
            <Metric label="SEO" value={fmt(data.performance.scores.seo)} />
            <Metric label="Performance" value={fmt(data.performance.scores.performance)} />
            <Metric label="Accessibility" value={fmt(data.performance.scores.accessibility)} />
          </div>
          <div className="print-grid" style={{ marginTop: 12 }}>
            <Metric label="Critical issues" value={String(critical.length)} />
            <Metric label="Warnings" value={String(warnings.length)} />
            <Metric label="Words" value={data.content.wordCount.toLocaleString()} />
            <Metric
              label="Broken links"
              value={data.links ? String(data.links.broken) : "—"}
            />
          </div>
        </section>

        {critical.length > 0 && (
          <IssueSection title="Critical — fix these first" issues={critical} tone="critical" />
        )}
        {warnings.length > 0 && <IssueSection title="Warnings" issues={warnings} tone="warning" />}
        {notes.length > 0 && <IssueSection title="Suggestions" issues={notes} tone="info" />}

        {data.issues.length === 0 && (
          <section className="print-section">
            <p className="print-clean">
              No on-page issues were found. Every check in this audit passed.
            </p>
          </section>
        )}

        <section className="print-section print-break">
          <h2>Technical checks</h2>
          <table className="print-table">
            <tbody>
              <Check label="Served over HTTPS" ok={data.technical.hasHttps} />
              <Check label="Mobile viewport" ok={data.technical.hasMobileViewport} />
              <Check label="Open Graph tags" ok={data.technical.hasOpenGraph} />
              <Check label="Twitter Card tags" ok={data.technical.hasTwitterCards} />
              <Check label="Structured data" ok={data.technical.hasStructuredData} />
              <Check label="robots.txt" ok={data.siteFiles.robotsTxt.present} />
              <Check label="Sitemap" ok={data.siteFiles.sitemap.present} />
              <Check
                label="All images have alt text"
                ok={data.technical.missingAltImages === 0}
                note={`${data.technical.imageAltCount} of ${data.technical.totalImages}`}
              />
            </tbody>
          </table>
        </section>

        <section className="print-section">
          <h2>Meta tags</h2>
          <table className="print-table">
            <tbody>
              <Row label="Title" value={data.meta.title || "Not set"} extra={`${data.meta.title.length} characters`} />
              <Row
                label="Description"
                value={data.meta.description || "Not set"}
                extra={`${data.meta.description.length} characters`}
              />
              <Row label="Canonical" value={data.meta.canonical || "Not set"} />
            </tbody>
          </table>
        </section>

        {data.performance.suggestions.length > 0 && (
          <section className="print-section print-break">
            <h2>Performance opportunities</h2>
            <table className="print-table">
              <tbody>
                {data.performance.suggestions.slice(0, 12).map((s) => (
                  <tr key={s.id}>
                    <td className="print-cell-label">{s.title}</td>
                    <td>{s.advice}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        <footer className="print-footer">
          <span>{brand || "SEO audit"}</span>
          <span>Generated by Quantalog</span>
        </footer>
      </article>
    </Box>
  );
}

function band(score: number): "good" | "ok" | "poor" {
  return score >= 90 ? "good" : score >= 50 ? "ok" : "poor";
}

const fmt = (v: number | null) => (v === null ? "—" : String(v));

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="print-metric">
      <span className="print-metric-value">{value}</span>
      <span className="print-metric-label">{label}</span>
    </div>
  );
}

function IssueSection({
  title,
  issues,
  tone,
}: {
  title: string;
  issues: SeoIssue[];
  tone: "critical" | "warning" | "info";
}) {
  return (
    <section className="print-section">
      <h2>{title}</h2>
      <ol className="print-issues">
        {issues.map((issue, i) => (
          <li key={i} data-tone={tone}>
            <strong>{issue.title}</strong>
            <span>{issue.detail}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}

function Check({ label, ok, note }: { label: string; ok: boolean; note?: string }) {
  return (
    <tr>
      <td className="print-cell-label">{label}</td>
      <td>
        <span data-ok={ok} className="print-check">
          {ok ? "Pass" : "Fail"}
        </span>
        {note && <span className="print-note"> {note}</span>}
      </td>
    </tr>
  );
}

function Row({ label, value, extra }: { label: string; value: string; extra?: string }) {
  return (
    <tr>
      <td className="print-cell-label">{label}</td>
      <td>
        {value}
        {extra && <span className="print-note"> — {extra}</span>}
      </td>
    </tr>
  );
}
