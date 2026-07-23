import { useState } from "react";
import {
  Badge, Box, Card, Code, Group, Progress, RingProgress, ScrollArea, SimpleGrid,
  Stack, Table, Text, ThemeIcon, Anchor, Accordion, Alert, Center, Divider, Tooltip,
  Modal, UnstyledButton,
} from "@mantine/core";
import {
  AlertTriangle, CheckCircle2, Info, XCircle, FileText, Image as ImageIcon,
  Link2, Type, Gauge, ShieldCheck, ExternalLink, Smartphone, Monitor, Sparkles,
  FileSearch, Share2, Bot, Server, Clock, Eye,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type {
  SeoContent, SeoIssue, SeoMeta, SeoPerformance, SeoSiteFiles, SeoTechnical,
  SeoStrategyResult,
} from "../../types";
import { num } from "../../utils";
import { ScoreRing, scoreColor, scoreLabel } from "./ScoreRing";

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
  right,
  children,
  padding = "lg",
}: {
  title: string;
  description?: string;
  icon: LucideIcon;
  color?: string;
  right?: React.ReactNode;
  children: React.ReactNode;
  padding?: string | number;
}) {
  return (
    <Card withBorder radius="md" padding={padding}>
      <Group justify="space-between" align="flex-start" wrap="nowrap" mb="md" px={padding === 0 ? "lg" : 0} pt={padding === 0 ? "lg" : 0}>
        <Group gap="sm" wrap="nowrap">
          <ThemeIcon size={32} radius="md" variant="light" color={color}>
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
}: {
  score: number;
  performance: SeoPerformance;
  issues: SeoIssue[];
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
              <ScoreRing label="Overall score" score={score} size={168} hero />
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
            </Stack>
          </Box>

          <Box className="seo-hero-split" p="xl" style={{ flex: "2 1 420px", minWidth: 280 }}>
            <Group justify="space-between" mb="lg" wrap="nowrap">
              <Text size="xs" fw={650} c="dimmed" tt="uppercase" style={{ letterSpacing: "0.06em" }}>
                Lighthouse
              </Text>
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
  let display = url;
  try {
    const u = new URL(url);
    display = `${u.hostname}${u.pathname === "/" ? "" : u.pathname}`;
  } catch {
    /* fall back to the raw string */
  }

  return (
    <Box p="md" style={{ background: "var(--mantine-color-body)", borderRadius: 10 }}>
      <Text size="xs" c="dimmed" mb={4} truncate>
        {display}
      </Text>
      <Text size="md" c="blue" fw={500} lh={1.3} mb={4}>
        {clip(meta.title || "Untitled page", 60)}
      </Text>
      <Text size="xs" c="dimmed" lh={1.55}>
        {meta.description
          ? clip(meta.description, 160)
          : "No meta description — search engines will pull a snippet from the page copy instead."}
      </Text>
    </Box>
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
  color = "emerald",
  hint,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  color?: string;
  hint?: string;
}) {
  const body = (
    <Box className="seo-tile" p="md">
      <ThemeIcon size={30} radius="md" variant="light" color={color} mb="sm">
        <Icon size={15} />
      </ThemeIcon>
      <Text fz={26} fw={750} lh={1.1} style={{ letterSpacing: "-0.03em" }}>
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
          color={content.h1Count === 1 ? "emerald" : "yellow"}
          hint="Exactly one H1 per page."
        />
        <Tile
          label="H2 / H3"
          value={`${content.h2Count} / ${content.h3Count}`}
          icon={Type}
          color="teal"
          hint="Subheadings that break the page into sections."
        />
        <Tile label="Images" value={String(content.imgCount)} icon={ImageIcon} color="grape" />
        <Tile
          label="Links total"
          value={String(content.linkCount)}
          icon={Link2}
          color="blue"
          hint="Every anchor on the page, internal and external."
        />
        <Tile label="Internal links" value={String(content.internalLinks)} icon={Link2} color="cyan" />
        <Tile label="External links" value={String(content.externalLinks)} icon={ExternalLink} color="indigo" />
        <Tile
          label={band.label}
          value={String(content.readabilityScore)}
          icon={Gauge}
          color={band.color}
          hint="Flesch Reading Ease, 0-100. Higher is easier to read."
        />
      </SimpleGrid>

      <Panel
        title="Content quality"
        description="A composite of length, heading structure, alt text, links and structured data."
        icon={Gauge}
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
}: {
  technical: SeoTechnical;
  performance: SeoPerformance;
  siteFiles: SeoSiteFiles;
}) {
  return (
    <Stack gap="lg">
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
                color={technical.statusCode < 300 ? "teal" : technical.statusCode < 400 ? "yellow" : "red"}
              />
              <Tile
                label="Response time"
                value={`${technical.responseTimeMs} ms`}
                icon={Clock}
                color={
                  technical.responseTimeMs < 600
                    ? "teal"
                    : technical.responseTimeMs < 1500
                    ? "yellow"
                    : "red"
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
