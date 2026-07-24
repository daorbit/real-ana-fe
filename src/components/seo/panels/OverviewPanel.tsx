import { Alert, Badge, Box, Card, Center, Group, SimpleGrid, Stack, Text, ThemeIcon } from "@mantine/core";
import {
  AlertTriangle, CheckCircle2, XCircle, FileText, Image as ImageIcon, Share2, Bot,
  Lock, Braces, Smartphone, Sparkles, TrendingUp, TrendingDown, Minus,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type {
  SeoContent, SeoIssue, SeoPerformance, SeoScores, SeoSiteFiles, SeoTechnical,
  SeoReportSummary,
} from "../../../types";
import { num } from "../../../utils";
import { scoreColor, scoreLabel } from "../ScoreRing";
import { Gauge } from "../shared/Gauge";
import { SEVERITY } from "../shared/Panel";
import { useIssueBreakdown } from "../hooks";
import { AREA_LABEL, bandHex, pageSize, severityHex } from "../utils";

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
  const breakdown = useIssueBreakdown(issues);

  return (
    <Stack gap="md">
      {breakdown.critical > 0 && (
        <Alert color="red" variant="light" radius="md" icon={<AlertTriangle size={16} />}>
          {breakdown.critical} critical issue{breakdown.critical === 1 ? "" : "s"}{" "}
          {breakdown.critical === 1 ? "is" : "are"} holding this page back. Fix those first.
        </Alert>
      )}

      <Box className="seo-bento">
        <ScoreHero score={score} scores={performance.scores} available={performance.available} />
        <SeverityDonut breakdown={breakdown} />
        <MetricStrip content={content} technical={technical} />
        <ScoreSpark history={history} current={score} />
        <IssuesByArea breakdown={breakdown} />

        <Card withBorder radius="md" padding="lg" className="col-7 seo-panel">
          <Group justify="space-between" mb="md">
            <Text size="sm" fw={600} c="dimmed">Priority fixes</Text>
            <Text className="seo-eyebrow">Worst first</Text>
          </Group>
          {breakdown.priority.length ? (
            <Stack gap={10}>
              {breakdown.priority.map((issue, i) => (
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

/* --------------------------------- widgets -------------------------------- */

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
          <Gauge value={score} color={bandHex(score)}>
            <Text className="g-num" fz={46}>{score}</Text>
            <Text className="g-of">/ 100</Text>
          </Gauge>
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
function SeverityDonut({ breakdown }: { breakdown: ReturnType<typeof useIssueBreakdown> }) {
  const { critical: crit, warning: warn, info, total } = breakdown;
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
      <Text size="sm" fw={600} c="dimmed" mb="md">Issues by severity</Text>
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
    return <Badge size="sm" variant="light" color="gray" leftSection={<Minus size={11} />}>0</Badge>;
  const up = delta > 0;
  return (
    <Badge size="sm" variant="light" color={up ? "teal" : "red"} leftSection={up ? <TrendingUp size={11} /> : <TrendingDown size={11} />}>
      {up ? "+" : ""}{delta}
    </Badge>
  );
}

/** Ranked horizontal bars — which part of the page the issues concentrate in. */
function IssuesByArea({ breakdown }: { breakdown: ReturnType<typeof useIssueBreakdown> }) {
  const max = Math.max(1, ...breakdown.byArea.map((c) => c.n));
  return (
    <Card withBorder radius="md" padding="lg" className="col-5 seo-panel">
      <Text size="sm" fw={600} c="dimmed" mb="md">Where issues cluster</Text>
      <Stack gap={13}>
        {breakdown.byArea.map((c) => (
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

function PriorityRow({ issue }: { issue: SeoIssue }) {
  const s = SEVERITY[issue.severity];
  const Icon = s.icon;
  return (
    <Box className="seo-issue" p="sm" style={{ "--seo-rail": s.rail } as React.CSSProperties}>
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
