import { useState } from "react";
import {
  Badge, Box, Card, Code, Group, Progress, RingProgress, ScrollArea, SimpleGrid,
  Stack, Table, Text, ThemeIcon, Anchor, Accordion, Alert, Center, Divider, Tooltip,
  Modal, UnstyledButton,
} from "@mantine/core";
import {
  AlertTriangle, CheckCircle2, Info, XCircle, FileText, Image as ImageIcon,
  Link2, Type, Gauge, ShieldCheck, ExternalLink, Smartphone, Monitor, Sparkles,
  FileSearch, Share2, Bot, Server, Clock, Eye, Globe,
  Lock, Braces, TrendingUp, TrendingDown, Minus,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type {
  SeoContent, SeoIssue, SeoMeta, SeoPerformance, SeoSiteFiles, SeoTechnical,
  SeoStrategyResult, SeoScores, SeoReportSummary,
} from "../../types";
import { num } from "../../utils";
import { ScoreRing, scoreColor, scoreLabel } from "./ScoreRing";
import { CrawlerFilesPanel } from "./SchemaPanel";

/* --------------------------- overview: bento ------------------------------ */

/** Emerald for the focal score, three semantic tones for everything else. */
function bandHex(score: number | null): string {
  if (score === null) return "var(--muted)";
  if (score >= 90) return "var(--mantine-color-teal-6)";
  if (score >= 50) return "var(--mantine-color-yellow-6)";
  return "var(--mantine-color-red-6)";
}

/** A radial gauge drawn as an SVG ring — the report's focal figure. */
function Gauge2({
  value,
  size = 150,
  thickness = 11,
  color = "var(--mantine-color-emerald-6)",
  children,
}: {
  value: number;
  size?: number;
  thickness?: number;
  color?: string;
  children: React.ReactNode;
}) {
  const r = (size - thickness) / 2;
  const circ = 2 * Math.PI * r;
  const off = circ * (1 - Math.max(0, Math.min(100, value)) / 100);
  return (
    <Box className="seo-gauge" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--surface-2)" strokeWidth={thickness} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={thickness}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={off}
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />
      </svg>
      <div>{children}</div>
    </Box>
  );
}

/** The focal hero: overall score gauge + the four Lighthouse categories as bars. */
function ScoreHero({ score, scores, available }: { score: number; scores: SeoScores; available: boolean }) {
  const cats: { label: string; value: number | null }[] = [
    { label: "SEO", value: scores.seo },
    { label: "Performance", value: scores.performance },
    { label: "Accessibility", value: scores.accessibility },
    { label: "Best practices", value: scores.bestPractices },
  ];
  return (
    <Card withBorder radius="md" padding="lg" className="col-8 seo-panel">
      <Group justify="space-between" mb="lg">
        <Text className="seo-eyebrow">Audit summary</Text>
        {!available && (
          <Badge size="xs" variant="light" color="gray">Re-run for category scores</Badge>
        )}
      </Group>
      <Group gap={28} align="center" wrap="wrap">
        <Stack gap={8} align="center">
          <Gauge2 value={score} color={bandHex(score)}>
            <Text className="g-num" fz={46}>{score}</Text>
            <Text className="g-of">/ 100</Text>
          </Gauge2>
          <Group gap={5} align="center">
            <ThemeIcon size={16} radius="xl" variant="transparent" color={scoreColor(score)}>
              <ScoreBadgeInline score={score} />
            </ThemeIcon>
            <Text size="xs" fw={600} c={scoreColor(score)}>{scoreLabel(score)}</Text>
          </Group>
        </Stack>
        <Box className="seo-cats">
          {cats.map((c) => (
            <Box key={c.label} className="seo-cat">
              <Box className="top">
                <Text size="xs" c="dimmed">{c.label}</Text>
                <Text className="v" c={c.value === null ? "dimmed" : undefined}>{c.value ?? "—"}</Text>
              </Box>
              <Box className="seo-track">
                <i style={{ width: `${c.value ?? 0}%`, background: bandHex(c.value) }} />
              </Box>
            </Box>
          ))}
        </Box>
      </Group>
    </Card>
  );
}

function ScoreBadgeInline({ score }: { score: number }) {
  const Icon = score >= 90 ? CheckCircle2 : score >= 50 ? AlertTriangle : XCircle;
  return <Icon size={12} />;
}

/** Issue split as a stacked donut with a counted legend. */
function SeverityDonut({ issues }: { issues: SeoIssue[] }) {
  const crit = issues.filter((i) => i.severity === "critical").length;
  const warn = issues.filter((i) => i.severity === "warning").length;
  const info = issues.filter((i) => i.severity === "info").length;
  const total = issues.length;

  const size = 108, thickness = 13;
  const r = (size - thickness) / 2;
  const circ = 2 * Math.PI * r;
  const seg = [
    { n: crit, color: "var(--mantine-color-red-6)" },
    { n: warn, color: "var(--mantine-color-yellow-6)" },
    { n: info, color: "var(--mantine-color-emerald-6)" },
  ];
  let acc = 0;

  return (
    <Card withBorder radius="md" padding="lg" className="col-4 seo-panel">
      <Text className="card-title" size="sm" fw={600} c="dimmed" mb="md">Issues by severity</Text>
      <Group gap={20} wrap="nowrap">
        <Box className="seo-gauge" style={{ width: size, height: size }}>
          <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
            <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--surface-2)" strokeWidth={thickness} />
            {total > 0 &&
              seg.map((s, i) => {
                if (s.n === 0) return null;
                const frac = s.n / total;
                const dash = circ * frac;
                const gap = circ - dash;
                const offset = -circ * acc;
                acc += frac;
                return (
                  <circle
                    key={i}
                    cx={size / 2}
                    cy={size / 2}
                    r={r}
                    fill="none"
                    stroke={s.color}
                    strokeWidth={thickness}
                    strokeDasharray={`${dash} ${gap}`}
                    strokeDashoffset={offset}
                  />
                );
              })}
          </svg>
          <div>
            <Text className="g-num" fz={26}>{total}</Text>
            <Text className="g-of">{total === 1 ? "issue" : "issues"}</Text>
          </div>
        </Box>
        <Stack gap={9} style={{ flex: 1 }}>
          <LegendRow color="var(--mantine-color-red-6)" label="Critical" n={crit} />
          <LegendRow color="var(--mantine-color-yellow-6)" label="Warnings" n={warn} />
          <LegendRow color="var(--mantine-color-emerald-6)" label="Suggestions" n={info} />
        </Stack>
      </Group>
    </Card>
  );
}

function LegendRow({ color, label, n }: { color: string; label: string; n: number }) {
  return (
    <Group gap={8} wrap="nowrap">
      <Box w={9} h={9} style={{ borderRadius: 3, background: color, flexShrink: 0 }} />
      <Text size="xs" c="dimmed">{label}</Text>
      <Text size="xs" fw={700} ml="auto" style={{ fontFamily: "var(--font-display)", fontVariantNumeric: "tabular-nums" }}>
        {n}
      </Text>
    </Group>
  );
}

/** A row of headline numbers, divided, no dead space. */
function MetricStrip({ content, technical }: { content: SeoContent; technical: SeoTechnical }) {
  const size = pageSize(technical.contentLength);
  const [sizeVal, sizeUnit] = size === "—" ? ["—", ""] : size.split(" ");
  return (
    <Card withBorder radius="md" padding="md" className="col-8 seo-panel">
      <Box className="seo-mstrip">
        <MetricCell k="Words" v={num(content.wordCount)} />
        <MetricCell k="Response" v={String(technical.responseTimeMs)} unit="ms" />
        <MetricCell k="Page size" v={sizeVal} unit={sizeUnit} />
        <MetricCell k="Images" v={String(technical.totalImages)} />
      </Box>
    </Card>
  );
}

function MetricCell({ k, v, unit }: { k: string; v: string; unit?: string }) {
  return (
    <Box>
      <Text size="xs" c="dimmed" tt="uppercase" mb={5} style={{ letterSpacing: "0.05em" }}>{k}</Text>
      <Text className="mv">
        {v}
        {unit && <Text span size="xs" c="dimmed" fw={500} ml={2}>{unit}</Text>}
      </Text>
    </Box>
  );
}

/** Score-over-time, drawn as a filled sparkline with an emphasised endpoint. */
function ScoreSpark({ history, current }: { history: SeoReportSummary[]; current: number }) {
  // Oldest to newest; history arrives newest-first.
  const pts = [...history].reverse().map((h) => h.score);
  if (pts.length < 2) pts.unshift(current);
  const w = 240, h = 48;
  const min = Math.min(...pts), max = Math.max(...pts);
  const span = Math.max(1, max - min);
  const step = w / (pts.length - 1);
  const xy = pts.map((p, i) => [i * step, h - 6 - ((p - min) / span) * (h - 12)]);
  const line = xy.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const area = `${line} L${w},${h} L0,${h} Z`;
  const prev = pts.length > 1 ? pts[pts.length - 2] : current;
  const delta = current - prev;
  const [ex, ey] = xy[xy.length - 1];

  return (
    <Card withBorder radius="md" padding="lg" className="col-4 seo-panel">
      <Group justify="space-between" align="flex-end" mb={8}>
        <Box>
          <Text size="sm" fw={600} c="dimmed" mb={6}>Score trend</Text>
          <Text style={{ fontFamily: "var(--font-display)", fontSize: 30, fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>
            {current}
          </Text>
        </Box>
        <DeltaPill delta={delta} />
      </Group>
      <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
        <defs>
          <linearGradient id="seoSpark" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="var(--mantine-color-emerald-6)" stopOpacity="0.35" />
            <stop offset="1" stopColor="var(--mantine-color-emerald-6)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={area} fill="url(#seoSpark)" />
        <path d={line} fill="none" stroke="var(--mantine-color-emerald-6)" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
        <circle cx={ex} cy={ey} r={3.5} fill="var(--mantine-color-emerald-6)" />
      </svg>
    </Card>
  );
}

function DeltaPill({ delta }: { delta: number }) {
  if (delta === 0)
    return (
      <Badge size="sm" variant="light" color="gray" leftSection={<Minus size={11} />}>0</Badge>
    );
  const up = delta > 0;
  return (
    <Badge size="sm" variant="light" color={up ? "teal" : "red"} leftSection={up ? <TrendingUp size={11} /> : <TrendingDown size={11} />}>
      {up ? "+" : ""}{delta}
    </Badge>
  );
}

const AREA_LABEL: Record<SeoIssue["area"], string> = {
  meta: "Meta",
  content: "Content",
  technical: "Technical",
  files: "Crawler files",
};

/** Ranked horizontal bars — which part of the page the issues concentrate in. */
function IssuesByArea({ issues }: { issues: SeoIssue[] }) {
  const counts = (Object.keys(AREA_LABEL) as SeoIssue["area"][]).map((area) => ({
    area,
    n: issues.filter((i) => i.area === area).length,
    // A bar's colour tracks the worst severity present in that area.
    worst: worstSeverity(issues.filter((i) => i.area === area)),
  }));
  const max = Math.max(1, ...counts.map((c) => c.n));

  return (
    <Card withBorder radius="md" padding="lg" className="col-5 seo-panel">
      <Text size="sm" fw={600} c="dimmed" mb="md">Where issues cluster</Text>
      <Stack gap={13}>
        {counts.map((c) => (
          <Box key={c.area} className="seo-hbar">
            <Text size="xs" c="dimmed" truncate>{AREA_LABEL[c.area]}</Text>
            <Box className="t">
              <i style={{ width: `${(c.n / max) * 100}%`, background: severityHex(c.worst) }} />
            </Box>
            <Text size="xs" fw={650} ta="right" style={{ fontVariantNumeric: "tabular-nums", color: "var(--text-2)" }}>
              {c.n}
            </Text>
          </Box>
        ))}
      </Stack>
    </Card>
  );
}

function worstSeverity(issues: SeoIssue[]): SeoIssue["severity"] | null {
  if (issues.some((i) => i.severity === "critical")) return "critical";
  if (issues.some((i) => i.severity === "warning")) return "warning";
  if (issues.some((i) => i.severity === "info")) return "info";
  return null;
}
function severityHex(s: SeoIssue["severity"] | null): string {
  if (s === "critical") return "var(--mantine-color-red-6)";
  if (s === "warning") return "var(--mantine-color-yellow-6)";
  if (s === "info") return "var(--mantine-color-emerald-6)";
  return "var(--surface-2)";
}

/** The pass/fail signals, two columns, with real icons. */
function TechChecks({ technical, siteFiles }: { technical: SeoTechnical; siteFiles: SeoSiteFiles }) {
  const rows: { label: string; ok: boolean; icon: LucideIcon }[] = [
    { label: "Served over HTTPS", ok: technical.hasHttps, icon: Lock },
    { label: "Mobile viewport tag", ok: technical.hasMobileViewport, icon: Smartphone },
    { label: "Open Graph tags", ok: technical.hasOpenGraph, icon: Share2 },
    { label: "Twitter Card tags", ok: technical.hasTwitterCards, icon: Share2 },
    { label: "Structured data (JSON-LD)", ok: technical.hasStructuredData, icon: Braces },
    { label: "robots.txt present", ok: siteFiles.robotsTxt.present, icon: Bot },
    { label: "Sitemap referenced", ok: siteFiles.sitemap.present, icon: FileText },
    { label: "All images have alt text", ok: technical.missingAltImages === 0, icon: ImageIcon },
  ];
  const passing = rows.filter((r) => r.ok).length;
  const mid = Math.ceil(rows.length / 2);

  return (
    <Card withBorder radius="md" padding="lg" className="col-12 seo-panel">
      <Group justify="space-between" mb="md">
        <Text size="sm" fw={600} c="dimmed">Technical checks</Text>
        <Text className="seo-eyebrow">{passing} of {rows.length} passing</Text>
      </Group>
      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing={{ base: 0, sm: 40 }}>
        <Stack gap={0}>{rows.slice(0, mid).map((r) => <CheckLine key={r.label} {...r} />)}</Stack>
        <Stack gap={0}>{rows.slice(mid).map((r) => <CheckLine key={r.label} {...r} />)}</Stack>
      </SimpleGrid>
    </Card>
  );
}

function CheckLine({ label, ok, icon: Icon }: { label: string; ok: boolean; icon: LucideIcon }) {
  return (
    <Group gap={10} wrap="nowrap" py={11} style={{ borderBottom: "1px solid var(--seo-hairline)" }}>
      <ThemeIcon size={24} radius="sm" variant="light" color="gray">
        <Icon size={13} />
      </ThemeIcon>
      <Text size="sm">{label}</Text>
      <Badge size="sm" variant="light" color={ok ? "teal" : "red"} ml="auto" radius="xl">
        {ok ? "Pass" : "Fail"}
      </Badge>
    </Group>
  );
}

/**
 * The Overview tab, laid out as a bento: one focal score, then a dense grid of
 * purpose-built widgets. Everything a client reads first, above the fold.
 */
export function OverviewPanel({
  data,
  history,
}: {
  data: {
    score: number;
    performance: SeoPerformance;
    issues: SeoIssue[];
    content: SeoContent;
    technical: SeoTechnical;
    siteFiles: SeoSiteFiles;
  };
  history: SeoReportSummary[];
}) {
  const { score, performance, issues, content, technical, siteFiles } = data;
  const critical = issues.filter((i) => i.severity === "critical");
  const priority = [...issues].sort((a, b) => sevRank(a.severity) - sevRank(b.severity)).slice(0, 4);

  return (
    <Stack gap="md">
      {critical.length > 0 && (
        <Alert color="red" variant="light" radius="md" icon={<AlertTriangle size={16} />}>
          {critical.length} critical issue{critical.length === 1 ? "" : "s"} {critical.length === 1 ? "is" : "are"} holding this page back. Fix those first.
        </Alert>
      )}

      <Box className="seo-bento">
        <ScoreHero score={score} scores={performance.scores} available={performance.available} />
        <SeverityDonut issues={issues} />
        <MetricStrip content={content} technical={technical} />
        <ScoreSpark history={history} current={score} />
        <IssuesByArea issues={issues} />

        <Card withBorder radius="md" padding="lg" className="col-7 seo-panel">
          <Group justify="space-between" mb="md">
            <Text size="sm" fw={600} c="dimmed">Priority fixes</Text>
            <Text className="seo-eyebrow">Worst first</Text>
          </Group>
          {priority.length ? (
            <Stack gap={10}>
              {priority.map((issue, i) => (
                <PriorityRow key={`${issue.title}-${i}`} issue={issue} />
              ))}
            </Stack>
          ) : (
            <Center py="lg">
              <Group gap={8}>
                <ThemeIcon size={30} radius="xl" variant="light" color="teal"><Sparkles size={15} /></ThemeIcon>
                <Text size="sm" c="dimmed">Every check came back clean.</Text>
              </Group>
            </Center>
          )}
        </Card>

        <TechChecks technical={technical} siteFiles={siteFiles} />
      </Box>
    </Stack>
  );
}

function sevRank(s: SeoIssue["severity"]): number {
  return s === "critical" ? 0 : s === "warning" ? 1 : 2;
}

function PriorityRow({ issue }: { issue: SeoIssue }) {
  const s = SEVERITY[issue.severity];
  const Icon = s.icon;
  return (
    <Box
      className="seo-issue"
      p="sm"
      style={{ "--seo-rail": s.rail } as React.CSSProperties}
    >
      <Group gap={12} align="flex-start" wrap="nowrap">
        <ThemeIcon size={26} radius="sm" variant="light" color={s.color}>
          <Icon size={13} />
        </ThemeIcon>
        <div style={{ minWidth: 0, flex: 1 }}>
          <Group gap={8} mb={2} wrap="wrap">
            <Text size="sm" fw={600}>{issue.title}</Text>
            <Badge size="xs" variant="default" tt="capitalize">{issue.area}</Badge>
          </Group>
          <Text size="xs" c="dimmed" lh={1.5} lineClamp={2}>{issue.detail}</Text>
        </div>
      </Group>
    </Box>
  );
}

/* --------------------------------- shared -------------------------------- */

const SEVERITY = {
  critical: { color: "red", icon: XCircle, label: "Critical", rail: "#ef4444" },
  warning: { color: "yellow", icon: AlertTriangle, label: "Warning", rail: "#f59e0b" },
  info: { color: "blue", icon: Info, label: "Suggestion", rail: "#3b82f6" },
} as const;

/** A pass/fail row for a boolean signal, since half of technical SEO is one. */
function CheckRow({
  ok,
  label,
  detail,
  icon: Icon,
}: {
  ok: boolean;
  label: string;
  detail?: string;
  icon?: LucideIcon;
}) {
  return (
    <Group gap="sm" wrap="nowrap" py={9}>
      <ThemeIcon size={26} radius="xl" variant="light" color={ok ? "teal" : "red"}>
        {Icon ? <Icon size={13} /> : ok ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
      </ThemeIcon>
      <div style={{ minWidth: 0, flex: 1 }}>
        <Text size="sm" fw={500}>
          {label}
        </Text>
        {detail && (
          <Text size="xs" c="dimmed" truncate>
            {detail}
          </Text>
        )}
      </div>
      <Badge size="xs" variant="light" color={ok ? "teal" : "red"}>
        {ok ? "Pass" : "Fail"}
      </Badge>
    </Group>
  );
}

/** A titled panel — the house card, with a tinted icon so tabs stay scannable. */
function Panel({
  title,
  description,
  icon: Icon,
  color = "emerald",
  semantic = false,
  right,
  children,
  padding = "lg",
}: {
  title: string;
  description?: string;
  icon: LucideIcon;
  color?: string;
  /** When true, the icon keeps `color` because it signals status; otherwise neutral. */
  semantic?: boolean;
  right?: React.ReactNode;
  children: React.ReactNode;
  padding?: string | number;
}) {
  return (
    <Card withBorder radius="md" padding={padding} className="seo-panel">
      <Group
        justify="space-between"
        align="flex-start"
        wrap="nowrap"
        className="seo-panel-head"
        mb="md"
        pb="sm"
      >
        <Group gap="sm" wrap="nowrap">
          {/* One neutral icon treatment across every panel — a tinted chip per
              section was the rainbow that made the page read as unfinished. The
              `color` prop is still accepted so callers stay unchanged, but only
              a genuinely semantic panel (set via `semantic`) shows colour. */}
          <ThemeIcon size={32} radius="md" variant="light" color={semantic ? color : "gray"} className="seo-panel-ic">
            <Icon size={16} />
          </ThemeIcon>
          <div style={{ minWidth: 0 }}>
            <Text fw={650} size="sm" style={{ letterSpacing: "-0.01em" }}>
              {title}
            </Text>
            {description && (
              <Text size="xs" c="dimmed" mt={1}>
                {description}
              </Text>
            )}
          </div>
        </Group>
        {right}
      </Group>
      {children}
    </Card>
  );
}

function Empty({ children }: { children: string }) {
  return (
    <Center py="xl">
      <Stack align="center" gap={6}>
        <ThemeIcon size={34} radius="xl" variant="light" color="gray">
          <FileSearch size={17} />
        </ThemeIcon>
        <Text size="sm" c="dimmed" ta="center" maw={320}>
          {children}
        </Text>
      </Stack>
    </Center>
  );
}

/* -------------------------------- overview -------------------------------- */

export function IssueList({ issues }: { issues: SeoIssue[] }) {
  if (!issues.length) {
    return (
      <Card withBorder radius="md" padding="xl">
        <Center>
          <Stack align="center" gap="xs" maw={380}>
            <ThemeIcon size={48} radius="xl" variant="light" color="teal">
              <Sparkles size={24} />
            </ThemeIcon>
            <Text fw={650}>Nothing to fix</Text>
            <Text size="sm" c="dimmed" ta="center">
              Every on-page check this audit runs came back clean. Nice work.
            </Text>
          </Stack>
        </Center>
      </Card>
    );
  }

  return (
    <Stack gap="xs">
      {issues.map((issue, i) => {
        const s = SEVERITY[issue.severity];
        const Icon = s.icon;
        return (
          <Box
            key={`${issue.title}-${i}`}
            className="seo-issue"
            p="md"
            style={{ "--seo-rail": s.rail } as React.CSSProperties}
          >
            <Group gap="sm" align="flex-start" wrap="nowrap">
              <ThemeIcon size={28} radius="md" variant="light" color={s.color}>
                <Icon size={15} />
              </ThemeIcon>
              <div style={{ minWidth: 0, flex: 1 }}>
                <Group gap={8} wrap="wrap" mb={3}>
                  <Text size="sm" fw={600}>
                    {issue.title}
                  </Text>
                  <Badge size="xs" variant="light" color={s.color}>
                    {s.label}
                  </Badge>
                  <Badge size="xs" variant="default" tt="capitalize">
                    {issue.area}
                  </Badge>
                </Group>
                <Text size="xs" c="dimmed" lh={1.55}>
                  {issue.detail}
                </Text>
              </div>
            </Group>
          </Box>
        );
      })}
    </Stack>
  );
}

/**
 * The headline band: the overall score on the left as the one figure to read
 * first, the four Lighthouse categories beside it.
 */
export function ScorePanel({
  score,
  performance,
  issues,
  trend,
}: {
  score: number;
  performance: SeoPerformance;
  issues: SeoIssue[];
  /** Score-over-time chart, when there is more than one run to compare. */
  trend?: React.ReactNode;
}) {
  const critical = issues.filter((i) => i.severity === "critical").length;
  const warnings = issues.filter((i) => i.severity === "warning").length;
  const notes = issues.filter((i) => i.severity === "info").length;

  return (
    <Box className="seo-hero">
      <Box className="seo-hero-inner">
        <Group gap={0} align="stretch" wrap="wrap">
          <Box p="xl" style={{ flex: "1 1 260px", minWidth: 240 }}>
            <Stack align="center" gap="md">
              <Text className="seo-eyebrow" ta="center">
                Audit summary
              </Text>
              <ScoreRing label="Overall score" score={score} size={172} hero />
              <Group gap={6} justify="center">
                {critical > 0 && (
                  <Badge size="sm" variant="light" color="red">
                    {critical} critical
                  </Badge>
                )}
                {warnings > 0 && (
                  <Badge size="sm" variant="light" color="yellow">
                    {warnings} warning{warnings === 1 ? "" : "s"}
                  </Badge>
                )}
                {notes > 0 && (
                  <Badge size="sm" variant="light" color="blue">
                    {notes} suggestion{notes === 1 ? "" : "s"}
                  </Badge>
                )}
                {issues.length === 0 && (
                  <Badge size="sm" variant="light" color="teal">
                    No issues
                  </Badge>
                )}
              </Group>
              {trend && <Box w="100%">{trend}</Box>}
            </Stack>
          </Box>

          <Box className="seo-hero-split" p="xl" style={{ flex: "2 1 420px", minWidth: 280 }}>
            <Group justify="space-between" mb="lg" wrap="nowrap">
              <Text className="seo-eyebrow">Lighthouse categories</Text>
              {/* Old reports predate the Lighthouse integration and stored no
                  scores. Say that plainly instead of leaving four blank rings. */}
              {!performance.available && (
                <Badge size="xs" variant="light" color="gray">
                  Re-run for scores
                </Badge>
              )}
            </Group>
            <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="lg">
              <ScoreRing
                label="SEO"
                score={performance.scores.seo}
                hint="Crawlability, meta tags, link text and mobile friendliness."
              />
              <ScoreRing
                label="Performance"
                score={performance.scores.performance}
                hint="Load speed and Core Web Vitals, measured on the mobile profile Google indexes with."
              />
              <ScoreRing
                label="Accessibility"
                score={performance.scores.accessibility}
                hint="Contrast, labels, landmarks and other assistive-technology checks."
              />
              <ScoreRing
                label="Best practices"
                score={performance.scores.bestPractices}
                hint="Security, deprecated APIs and console errors."
              />
            </SimpleGrid>
          </Box>
        </Group>
      </Box>
    </Box>
  );
}

/* ---------------------------------- meta ---------------------------------- */

/** Search results truncate; the bar shows how close a field is to the limit. */
function LengthMeter({ value, min, max }: { value: string; min: number; max: number }) {
  const len = value.length;
  const ok = len >= min && len <= max;
  const color = !len ? "red" : ok ? "teal" : "yellow";
  return (
    <Group gap="xs" wrap="nowrap" mt={8}>
      <Progress
        value={Math.min(100, (len / max) * 100)}
        color={color}
        size="sm"
        radius="xl"
        style={{ flex: 1 }}
      />
      <Text size="xs" c={color === "teal" ? "dimmed" : color} fw={500}>
        {len}/{max}
      </Text>
    </Group>
  );
}

function MetaField({
  label,
  value,
  min,
  max,
  preview = false,
}: {
  label: string;
  value: string;
  min?: number;
  max?: number;
  /** Render a thumbnail alongside the value — for tags holding an image URL. */
  preview?: boolean;
}) {
  const body = value ? (
    <Text size="sm" style={{ wordBreak: "break-word" }} lh={1.5}>
      {value}
    </Text>
  ) : (
    <Text size="sm" c="dimmed" fs="italic">
      Not set on this page
    </Text>
  );

  return (
    <Box>
      <Group gap={6} mb={4}>
        <Text size="xs" c="dimmed" fw={650} tt="uppercase" style={{ letterSpacing: "0.05em" }}>
          {label}
        </Text>
        {!value && (
          <Badge size="xs" variant="light" color="red">
            Missing
          </Badge>
        )}
      </Group>
      {preview && value ? (
        <Group gap="sm" align="flex-start" wrap="nowrap">
          <Thumb src={value} alt={label} />
          <Box style={{ minWidth: 0, flex: 1 }}>{body}</Box>
        </Group>
      ) : (
        body
      )}
      {min !== undefined && max !== undefined && <LengthMeter value={value} min={min} max={max} />}
    </Box>
  );
}

/**
 * What the page looks like on a results page. Seeing the truncation is worth
 * more than being told a character count is over the limit.
 */
function SerpPreview({ meta, url }: { meta: SeoMeta; url: string }) {
  const clip = (s: string, n: number) => (s.length > n ? `${s.slice(0, n).trimEnd()}…` : s);
  let host = url;
  let crumbs: string[] = [];
  try {
    const u = new URL(url);
    host = u.hostname.replace(/^www\./, "");
    crumbs = u.pathname.split("/").filter(Boolean);
  } catch {
    /* fall back to the raw string */
  }

  return (
    <Box className="seo-serp">
      <Box className="seo-serp-crumb" mb={8}>
        <Box className="seo-serp-favicon">
          {meta.favicon ? (
            <FaviconDot src={meta.favicon} />
          ) : (
            <Globe size={13} style={{ opacity: 0.5 }} />
          )}
        </Box>
        <div style={{ minWidth: 0 }}>
          <Text size="xs" fw={550} lh={1.2} truncate>
            {host}
          </Text>
          <Text size="xs" c="dimmed" lh={1.2} truncate>
            {host}
            {crumbs.length > 0 && (
              <Text span c="dimmed">
                {" › "}
                {crumbs.join(" › ")}
              </Text>
            )}
          </Text>
        </div>
      </Box>
      <Text className="seo-serp-title" size="lg" fw={500} lh={1.3} mb={4}>
        {clip(meta.title || "Untitled page", 60)}
      </Text>
      <Text size="sm" c="dimmed" lh={1.55}>
        {meta.description
          ? clip(meta.description, 160)
          : "No meta description — search engines will pull a snippet from the page copy instead."}
      </Text>
    </Box>
  );
}

/** The site's favicon in the SERP row, degrading to a globe glyph if it 404s. */
function FaviconDot({ src }: { src: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) return <Globe size={13} style={{ opacity: 0.5 }} />;
  return (
    <img
      src={src}
      alt=""
      width={16}
      height={16}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
      style={{ borderRadius: 4, objectFit: "contain" }}
    />
  );
}

export function MetaPanel({ meta, url }: { meta: SeoMeta; url: string }) {
  return (
    <Stack gap="lg">
      <Panel
        title="Search preview"
        description="Roughly how this page reads on a results page."
        icon={FileSearch}
      >
        <SerpPreview meta={meta} url={url} />
      </Panel>

      <Panel title="Core tags" description="The fields search engines read first." icon={Type}>
        <Stack gap="lg">
          <MetaField label="Title" value={meta.title} min={30} max={60} />
          <Divider />
          <MetaField label="Meta description" value={meta.description} min={120} max={160} />
          <Divider />
          <MetaField label="Canonical URL" value={meta.canonical} />
          <Divider />
          <MetaField label="Keywords" value={meta.keywords} />
          <Divider />
          <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="lg">
            <MetaField label="Robots" value={meta.robots} />
            <MetaField label="Author" value={meta.author} />
            <MetaField label="Charset" value={meta.charset} />
            <MetaField label="Viewport" value={meta.viewport} />
            <MetaField label="Favicon" value={meta.favicon} />
          </SimpleGrid>
        </Stack>
      </Panel>

      <Panel
        title="Social previews"
        description="What a shared link renders as on social platforms."
        icon={Share2}
        color="blue"
      >
        <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xl">
          <Stack gap="md">
            <Badge variant="light" color="blue" w="fit-content">
              Open Graph
            </Badge>
            <MetaField label="og:title" value={meta.ogTitle} />
            <MetaField label="og:description" value={meta.ogDescription} />
            <MetaField label="og:image" value={meta.ogImage} preview />
            <MetaField label="og:type" value={meta.ogType} />
            <MetaField label="og:url" value={meta.ogUrl} />
            <MetaField label="og:site_name" value={meta.ogSiteName} />
          </Stack>
          <Stack gap="md">
            <Badge variant="light" color="cyan" w="fit-content">
              Twitter Card
            </Badge>
            <MetaField label="twitter:card" value={meta.twitterCard} />
            <MetaField label="twitter:title" value={meta.twitterTitle} />
            <MetaField label="twitter:description" value={meta.twitterDescription} />
            <MetaField label="twitter:image" value={meta.twitterImage} preview />
            <MetaField label="twitter:site" value={meta.twitterSite} />
          </Stack>
        </SimpleGrid>
      </Panel>

      <Card withBorder radius="md" padding={0}>
        {/* Open by default — the full tag list is the reason someone opens this
            tab, so making them click once more to reach it is friction. */}
        <Accordion variant="filled" radius="md" defaultValue="all">
          <Accordion.Item value="all" style={{ border: 0 }}>
            <Accordion.Control>
              <Group gap="sm">
                <ThemeIcon size={30} radius="md" variant="light" color="gray">
                  <Code style={{ background: "transparent", fontSize: 12 }}>{"<>"}</Code>
                </ThemeIcon>
                <Text size="sm" fw={650}>
                  All meta tags
                  <Text span c="dimmed" fw={400}>
                    {" "}
                    · {meta.allMetaTags.length}
                  </Text>
                </Text>
              </Group>
            </Accordion.Control>
            <Accordion.Panel>
              <ScrollArea.Autosize mah={360}>
                <Table striped highlightOnHover verticalSpacing="xs" fz="xs">
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th w={200}>Name</Table.Th>
                      <Table.Th>Content</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {meta.allMetaTags.map((t, i) => (
                      <Table.Tr key={`${t.name}-${i}`}>
                        <Table.Td>
                          <Code fz="xs">{t.name}</Code>
                        </Table.Td>
                        <Table.Td style={{ wordBreak: "break-word" }}>{t.content}</Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </ScrollArea.Autosize>
            </Accordion.Panel>
          </Accordion.Item>
        </Accordion>
      </Card>
    </Stack>
  );
}

/* -------------------------------- content --------------------------------- */

function Tile({
  label,
  value,
  icon: Icon,
  color: _color,
  tone,
  hint,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  /** Accepted for call-site compatibility; only used when `tone` marks the tile semantic. */
  color?: string;
  /** Set on tiles whose value carries a verdict (good/warn/bad); tints the value + icon. */
  tone?: "good" | "warn" | "bad";
  hint?: string;
}) {
  const toneColor =
    tone === "good" ? "teal" : tone === "warn" ? "yellow" : tone === "bad" ? "red" : "gray";
  const body = (
    <Box className="seo-tile" p="md">
      <ThemeIcon size={28} radius="md" variant="light" color={tone ? toneColor : "gray"} mb="sm">
        <Icon size={14} />
      </ThemeIcon>
      <Text
        fz={26}
        fw={700}
        lh={1.1}
        c={tone ? `${toneColor}.5` : undefined}
        style={{ letterSpacing: "-0.03em", fontFamily: "var(--font-display)", fontVariantNumeric: "tabular-nums" }}
      >
        {value}
      </Text>
      <Text size="xs" c="dimmed" mt={2} truncate>
        {label}
      </Text>
    </Box>
  );
  return hint ? (
    <Tooltip label={hint} withArrow>
      {body}
    </Tooltip>
  ) : (
    body
  );
}

/**
 * A thumbnail of an image found on the audited page.
 *
 * Loaded straight from the customer's own origin, which means some will fail —
 * hotlink protection, an auth wall, a URL that only resolves on their network.
 * A broken-image glyph would read as "your image is broken" when it is not, so
 * a failure falls back to a neutral placeholder instead.
 */
function Thumb({ src, alt, size = 48 }: { src: string; alt: string; size?: number }) {
  const [failed, setFailed] = useState(false);
  const [open, setOpen] = useState(false);

  const box: React.CSSProperties = { width: size, height: size };

  // Nothing to enlarge if it would not render at thumbnail size either.
  if (failed) {
    return (
      <Tooltip label="Could not load this image from here" withArrow>
        <Center
          style={{
            ...box,
            borderRadius: 8,
            boxShadow: "inset 0 0 0 1px var(--mantine-color-default-border)",
            background: "var(--mantine-color-body)",
            flexShrink: 0,
          }}
        >
          <ImageIcon size={16} style={{ opacity: 0.35 }} />
        </Center>
      </Tooltip>
    );
  }

  return (
    <>
      <UnstyledButton
        className="seo-thumb"
        style={box}
        onClick={() => setOpen(true)}
        aria-label={`Preview image${alt ? `: ${alt}` : ""}`}
      >
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          onError={() => setFailed(true)}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
        <Box className="seo-thumb-overlay">
          <Eye size={16} />
        </Box>
      </UnstyledButton>

      <Modal
        opened={open}
        onClose={() => setOpen(false)}
        title={
          <Text size="sm" fw={600}>
            {alt || "Image preview"}
          </Text>
        }
        size="lg"
        centered
        radius="md"
      >
        <Stack gap="sm">
          <Center
            style={{
              background: "var(--mantine-color-body)",
              borderRadius: 8,
              padding: 12,
              minHeight: 200,
            }}
          >
            <img
              src={src}
              alt={alt}
              style={{ maxWidth: "100%", maxHeight: "60vh", objectFit: "contain" }}
            />
          </Center>
          <Box>
            <Text size="xs" c="dimmed" fw={650} tt="uppercase" mb={3} style={{ letterSpacing: "0.05em" }}>
              Alt text
            </Text>
            {alt ? (
              <Text size="sm">{alt}</Text>
            ) : (
              <Badge size="sm" variant="light" color="yellow">
                Missing
              </Badge>
            )}
          </Box>
          <Box>
            <Text size="xs" c="dimmed" fw={650} tt="uppercase" mb={3} style={{ letterSpacing: "0.05em" }}>
              Source
            </Text>
            <Anchor
              href={src}
              target="_blank"
              rel="noopener noreferrer"
              size="xs"
              style={{ wordBreak: "break-all" }}
            >
              {src}
            </Anchor>
          </Box>
        </Stack>
      </Modal>
    </>
  );
}

/** Flesch bands, named — a bare "48" means nothing without the scale. */
function readabilityBand(score: number): { label: string; color: string } {
  if (score >= 70) return { label: "Easy to read", color: "teal" };
  if (score >= 50) return { label: "Fairly readable", color: "yellow" };
  if (score >= 30) return { label: "Difficult", color: "orange" };
  return { label: "Very difficult", color: "red" };
}

export function ContentPanel({ content }: { content: SeoContent }) {
  const missingAlt = content.images.filter((i) => !i.hasAlt);
  const band = readabilityBand(content.readabilityScore);

  return (
    <Stack gap="lg">
      <SimpleGrid cols={{ base: 2, sm: 4, lg: 8 }} spacing="md">
        <Tile label="Words" value={num(content.wordCount)} icon={FileText} hint="300+ is a reasonable floor for a page meant to rank." />
        <Tile
          label="H1 headings"
          value={String(content.h1Count)}
          icon={Type}
          tone={content.h1Count === 1 ? "good" : "warn"}
          hint="Exactly one H1 per page."
        />
        <Tile
          label="H2 / H3"
          value={`${content.h2Count} / ${content.h3Count}`}
          icon={Type}
          hint="Subheadings that break the page into sections."
        />
        <Tile label="Images" value={String(content.imgCount)} icon={ImageIcon} />
        <Tile
          label="Links total"
          value={String(content.linkCount)}
          icon={Link2}
          hint="Every anchor on the page, internal and external."
        />
        <Tile label="Internal links" value={String(content.internalLinks)} icon={Link2} />
        <Tile label="External links" value={String(content.externalLinks)} icon={ExternalLink} />
        <Tile
          label={band.label}
          value={String(content.readabilityScore)}
          icon={Gauge}
          tone={content.readabilityScore >= 70 ? "good" : content.readabilityScore >= 50 ? "warn" : "bad"}
          hint="Flesch Reading Ease, 0-100. Higher is easier to read."
        />
      </SimpleGrid>

      <Panel
        title="Content quality"
        description="A composite of length, heading structure, alt text, links and structured data."
        icon={Gauge}
        semantic
        color={content.contentQuality >= 70 ? "teal" : content.contentQuality >= 40 ? "yellow" : "red"}
        right={
          <Badge
            size="lg"
            variant="light"
            color={content.contentQuality >= 70 ? "teal" : content.contentQuality >= 40 ? "yellow" : "red"}
          >
            {content.contentQuality} / 100
          </Badge>
        }
      >
        <Progress
          value={content.contentQuality}
          size="lg"
          radius="xl"
          color={content.contentQuality >= 70 ? "teal" : content.contentQuality >= 40 ? "yellow" : "red"}
          mb="md"
        />
        <Group justify="space-between" wrap="nowrap" gap="md">
          <Group gap={8}>
            <Text size="xs" c="dimmed">
              Structured data
            </Text>
            {content.hasSchema ? (
              <Badge size="xs" variant="light" color="teal">
                Present
              </Badge>
            ) : (
              <Badge size="xs" variant="light" color="yellow">
                None
              </Badge>
            )}
          </Group>
          {content.schemaTypes.length > 0 && (
            <Group gap={5} wrap="wrap" justify="flex-end">
              {content.schemaTypes.map((t) => (
                <Badge key={t} size="xs" variant="default">
                  {t}
                </Badge>
              ))}
            </Group>
          )}
        </Group>
      </Panel>

      <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="lg">
        <Panel
          title="Heading structure"
          description="How the page is outlined for crawlers."
          icon={Type}
          color="teal"
        >
          {content.headingStructure.length ? (
            <ScrollArea.Autosize mah={340}>
              <Stack gap="md">
                {content.headingStructure.map((h) => (
                  <Box key={h.level}>
                    <Group gap={8} mb={6}>
                      <Badge size="sm" variant="light" color="emerald">
                        H{h.level}
                      </Badge>
                      <Text size="xs" c="dimmed">
                        {h.count} on the page
                      </Text>
                    </Group>
                    <Stack gap={3} pl="md" style={{ borderLeft: "1px solid var(--mantine-color-default-border)" }}>
                      {h.texts.slice(0, 6).map((t, i) => (
                        <Text key={i} size="xs" c="dimmed" truncate>
                          {t}
                        </Text>
                      ))}
                    </Stack>
                  </Box>
                ))}
              </Stack>
            </ScrollArea.Autosize>
          ) : (
            <Empty>No headings found. Crawlers use headings to understand what a page covers.</Empty>
          )}
        </Panel>

        <Panel
          title="Top keywords"
          description="Share of body text, common words excluded."
          icon={Sparkles}
          color="grape"
        >
          {content.keywordDensity.length ? (
            <ScrollArea.Autosize mah={340}>
              <Stack gap={10}>
                {content.keywordDensity.map((k) => (
                  <Box key={k.word}>
                    <Group justify="space-between" gap="xs" mb={4}>
                      <Text size="xs" fw={500} truncate>
                        {k.word}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {k.count}× · {k.density}%
                      </Text>
                    </Group>
                    <Progress
                      value={Math.min(100, k.density * 12)}
                      size="sm"
                      radius="xl"
                      color="grape"
                    />
                  </Box>
                ))}
              </Stack>
            </ScrollArea.Autosize>
          ) : (
            <Empty>Not enough text on this page to measure keyword density.</Empty>
          )}
        </Panel>
      </SimpleGrid>

      <Panel
        title="Images"
        description="Alt text is what search engines and screen readers read."
        icon={ImageIcon}
        color="grape"
        right={
          missingAlt.length > 0 ? (
            <Badge size="sm" variant="light" color="yellow">
              {missingAlt.length} missing alt
            </Badge>
          ) : content.images.length > 0 ? (
            <Badge size="sm" variant="light" color="teal">
              All labelled
            </Badge>
          ) : undefined
        }
      >
        {content.images.length ? (
          <ScrollArea.Autosize mah={360}>
            <Table striped highlightOnHover verticalSpacing="xs" fz="xs">
              <Table.Thead>
                <Table.Tr>
                  <Table.Th w={72}>Preview</Table.Th>
                  <Table.Th>Source</Table.Th>
                  <Table.Th w={220}>Alt text</Table.Th>
                  <Table.Th w={110}>Size</Table.Th>
                  <Table.Th w={80}>Loading</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {content.images.map((img, i) => (
                  <Table.Tr key={`${img.src}-${i}`}>
                    <Table.Td>
                      <Thumb src={img.src} alt={img.alt} />
                    </Table.Td>
                    <Table.Td style={{ maxWidth: 300 }}>
                      <Anchor
                        href={img.src}
                        target="_blank"
                        rel="noopener noreferrer"
                        size="xs"
                        truncate
                        display="block"
                      >
                        {img.src}
                      </Anchor>
                    </Table.Td>
                    <Table.Td>
                      {img.hasAlt ? (
                        <Text size="xs" truncate>
                          {img.alt}
                        </Text>
                      ) : (
                        <Badge size="xs" color="yellow" variant="light">
                          Missing
                        </Badge>
                      )}
                    </Table.Td>
                    <Table.Td>
                      <Text size="xs" c="dimmed">
                        {img.width && img.height ? `${img.width}×${img.height}` : "—"}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="xs" c="dimmed">
                        {img.loading || "eager"}
                      </Text>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </ScrollArea.Autosize>
        ) : (
          <Empty>No images on this page.</Empty>
        )}
      </Panel>
    </Stack>
  );
}

/* -------------------------------- technical ------------------------------- */

/** The server reports HTML bytes as a string; show it as something readable. */
function pageSize(contentLength: string): string {
  const bytes = Number(contentLength);
  if (!Number.isFinite(bytes) || bytes <= 0) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Google's own "good" thresholds for the metrics it treats as Core Web Vitals. */
const METRIC_ROWS: {
  key: keyof SeoStrategyResult["metrics"];
  label: string;
  unit: "ms" | "s" | "";
  good: number;
}[] = [
  { key: "largestContentfulPaint", label: "Largest Contentful Paint", unit: "s", good: 2500 },
  { key: "firstContentfulPaint", label: "First Contentful Paint", unit: "s", good: 1800 },
  { key: "speedIndex", label: "Speed Index", unit: "s", good: 3400 },
  { key: "interactive", label: "Time to Interactive", unit: "s", good: 3800 },
  { key: "totalBlockingTime", label: "Total Blocking Time", unit: "ms", good: 200 },
  { key: "cumulativeLayoutShift", label: "Cumulative Layout Shift", unit: "", good: 0.1 },
];

function MetricsTable({ result }: { result: SeoStrategyResult }) {
  return (
    <Stack gap={0}>
      {METRIC_ROWS.map((row, i) => {
        const v = result.metrics[row.key];
        if (v === null) return null;
        const display =
          row.unit === "s" ? `${(v / 1000).toFixed(1)} s` : row.unit === "ms" ? `${v} ms` : String(v);
        const color = v <= row.good ? "teal" : v <= row.good * 2 ? "yellow" : "red";
        return (
          <Box key={row.key}>
            {i > 0 && <Divider />}
            <Group justify="space-between" py={9} wrap="nowrap">
              <Text size="sm">{row.label}</Text>
              <Badge size="sm" variant="light" color={color}>
                {display}
              </Badge>
            </Group>
          </Box>
        );
      })}
    </Stack>
  );
}

export function TechnicalPanel({
  technical,
  performance,
  siteFiles,
  vitals,
}: {
  technical: SeoTechnical;
  performance: SeoPerformance;
  siteFiles: SeoSiteFiles;
  /** Real-user Core Web Vitals, shown beside the Lighthouse lab numbers. */
  vitals?: React.ReactNode;
}) {
  return (
    <Stack gap="lg">
      {vitals}
      <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="lg">
        <Panel
          title="Page checks"
          description="The signals a crawler looks for on every page."
          icon={ShieldCheck}
          color="teal"
        >
          <Stack gap={0}>
            <CheckRow ok={technical.hasHttps} label="Served over HTTPS" />
            <Divider />
            <CheckRow ok={technical.hasMobileViewport} label="Mobile viewport tag" icon={Smartphone} />
            <Divider />
            <CheckRow ok={technical.hasFavicon} label="Favicon" />
            <Divider />
            <CheckRow ok={technical.hasOpenGraph} label="Open Graph tags" icon={Share2} />
            <Divider />
            <CheckRow ok={technical.hasTwitterCards} label="Twitter Card tags" icon={Share2} />
            <Divider />
            <CheckRow ok={technical.hasStructuredData} label="Structured data (JSON-LD)" />
            <Divider />
            <CheckRow
              ok={technical.missingAltImages === 0}
              label="All images have alt text"
              detail={`${technical.imageAltCount} of ${technical.totalImages} images`}
              icon={ImageIcon}
            />
          </Stack>
        </Panel>

        <Stack gap="lg">
          <Panel title="Response" description="What the server sent back." icon={Server} color="cyan">
            <SimpleGrid cols={2} spacing="md" mb="md">
              <Tile
                label="Status code"
                value={String(technical.statusCode)}
                icon={Server}
                tone={technical.statusCode < 300 ? "good" : technical.statusCode < 400 ? "warn" : "bad"}
              />
              <Tile
                label="Response time"
                value={`${technical.responseTimeMs} ms`}
                icon={Clock}
                tone={
                  technical.responseTimeMs < 600
                    ? "good"
                    : technical.responseTimeMs < 1500
                    ? "warn"
                    : "bad"
                }
                hint="Under 600 ms is a reasonable target."
              />
            </SimpleGrid>
            <Stack gap={0}>
              <Group justify="space-between" py={7} wrap="nowrap">
                <Text size="sm">Content type</Text>
                <Text size="xs" c="dimmed" truncate maw={200}>
                  {technical.contentType || "—"}
                </Text>
              </Group>
              <Divider />
              <Group justify="space-between" py={7} wrap="nowrap">
                <Text size="sm">Server</Text>
                <Text size="xs" c="dimmed" truncate maw={200}>
                  {technical.server || "—"}
                </Text>
              </Group>
              <Divider />
              <Group justify="space-between" py={7} wrap="nowrap">
                <Text size="sm">Page size</Text>
                <Text size="xs" c="dimmed">
                  {pageSize(technical.contentLength)}
                </Text>
              </Group>
            </Stack>
          </Panel>

          {/* Reports predating the validator only carry presence flags, so the
              old two-tick view stays as the fallback for those. */}
          {siteFiles.robotsReport || siteFiles.sitemapReport ? (
            <CrawlerFilesPanel
              robots={siteFiles.robotsReport}
              sitemap={siteFiles.sitemapReport}
            />
          ) : (
            <Panel
              title="Crawler files"
              description="How search engines discover the rest of the site."
              icon={Bot}
              color="indigo"
            >
              <Stack gap={0}>
                <CheckRow
                  ok={siteFiles.robotsTxt.present}
                  label="robots.txt"
                  detail={siteFiles.robotsTxt.url}
                  icon={Bot}
                />
                <Divider />
                <CheckRow
                  ok={siteFiles.sitemap.present}
                  label="Sitemap"
                  detail={siteFiles.sitemap.urls[0] ?? "Not referenced in robots.txt or at /sitemap.xml"}
                  icon={FileText}
                />
              </Stack>
              {siteFiles.sitemap.urls.length > 1 && (
                <Stack gap={2} mt="xs" pl={38}>
                  {siteFiles.sitemap.urls.slice(1).map((u) => (
                    <Anchor key={u} href={u} target="_blank" size="xs" truncate>
                      {u}
                    </Anchor>
                  ))}
                </Stack>
              )}
            </Panel>
          )}
        </Stack>
      </SimpleGrid>

      {performance.available && (
        <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="lg">
          {(["mobile", "desktop"] as const).map((strategy) => {
            const result = performance[strategy];
            if (!result) return null;
            const perf = result.scores.performance;
            return (
              <Panel
                key={strategy}
                title={strategy === "mobile" ? "Mobile" : "Desktop"}
                description="Core Web Vitals as measured by Lighthouse."
                icon={strategy === "mobile" ? Smartphone : Monitor}
                color={strategy === "mobile" ? "emerald" : "cyan"}
                right={
                  <Group gap={8} wrap="nowrap">
                    <RingProgress
                      size={40}
                      thickness={4}
                      roundCaps
                      sections={[{ value: perf ?? 0, color: scoreColor(perf) }]}
                      label={
                        <Text ta="center" size="xs" fw={700}>
                          {perf ?? "—"}
                        </Text>
                      }
                    />
                    <Text size="xs" c={scoreColor(perf)}>
                      {scoreLabel(perf)}
                    </Text>
                  </Group>
                }
              >
                <MetricsTable result={result} />
              </Panel>
            );
          })}
        </SimpleGrid>
      )}
    </Stack>
  );
}

/* ------------------------------- suggestions ------------------------------ */

export function SuggestionsPanel({ performance }: { performance: SeoPerformance }) {
  // No Lighthouse data at all — an older report, or a run Google could not
  // complete. Either way the fix is the same: run it again.
  if (!performance.available) {
    return (
      <Card withBorder radius="md" padding="xl">
        <Center>
          <Stack align="center" gap="xs" maw={400}>
            <ThemeIcon size={48} radius="xl" variant="light" color="gray">
              <Gauge size={24} />
            </ThemeIcon>
            <Text fw={650}>No Lighthouse data</Text>
            <Text size="sm" c="dimmed" ta="center">
              This report has no Lighthouse audit attached. Re-run it to pull fresh
              performance, accessibility and SEO scores.
            </Text>
          </Stack>
        </Center>
      </Card>
    );
  }

  if (!performance.suggestions.length) {
    return (
      <Card withBorder radius="md" padding="xl">
        <Center>
          <Stack align="center" gap="xs" maw={380}>
            <ThemeIcon size={48} radius="xl" variant="light" color="teal">
              <ShieldCheck size={24} />
            </ThemeIcon>
            <Text fw={650}>Clean sweep</Text>
            <Text size="sm" c="dimmed" ta="center">
              Lighthouse found nothing to fix on this page.
            </Text>
          </Stack>
        </Center>
      </Card>
    );
  }

  return (
    <Stack gap="md">
      <Alert color="blue" variant="light" icon={<Info size={16} />} radius="md">
        Sorted worst first. Each entry is a Lighthouse audit this page failed, with what to
        change and roughly what it saves.
      </Alert>
      <Accordion variant="separated" radius="md">
        {performance.suggestions.map((s) => (
          <Accordion.Item key={s.id} value={s.id}>
            <Accordion.Control>
              <Group gap="sm" wrap="nowrap">
                <RingProgress
                  size={38}
                  thickness={4}
                  roundCaps
                  sections={[{ value: s.score, color: scoreColor(s.score) }]}
                  label={
                    <Text ta="center" size="xs" fw={700}>
                      {s.score}
                    </Text>
                  }
                />
                <div style={{ minWidth: 0 }}>
                  <Text size="sm" fw={600} truncate>
                    {s.title}
                  </Text>
                  <Group gap={6}>
                    <Badge size="xs" variant="default" tt="capitalize">
                      {s.category.replace("-", " ")}
                    </Badge>
                    {s.displayValue && (
                      <Text size="xs" c="dimmed">
                        {s.displayValue}
                      </Text>
                    )}
                  </Group>
                </div>
              </Group>
            </Accordion.Control>
            <Accordion.Panel>
              <Stack gap="sm" pl={4}>
                <Text size="sm" lh={1.6}>
                  {s.advice}
                </Text>
                {s.description && s.description !== s.advice && (
                  <Text size="xs" c="dimmed" lh={1.55}>
                    {s.description}
                  </Text>
                )}
                {s.resources.length > 0 && (
                  <Box>
                    <Text size="xs" fw={650} c="dimmed" mb={5} tt="uppercase" style={{ letterSpacing: "0.05em" }}>
                      Affected resources
                    </Text>
                    <Stack gap={3}>
                      {s.resources.map((r) => (
                        <Text key={r} size="xs" c="dimmed" truncate>
                          {r}
                        </Text>
                      ))}
                    </Stack>
                  </Box>
                )}
              </Stack>
            </Accordion.Panel>
          </Accordion.Item>
        ))}
      </Accordion>
    </Stack>
  );
}
