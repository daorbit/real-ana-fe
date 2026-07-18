import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Box, Group, Text, Title, SimpleGrid, Center, Loader, Stack, ThemeIcon,
  UnstyledButton, Progress,
} from "@mantine/core";
import { AreaChart, Area, ResponsiveContainer, XAxis, Tooltip as RTooltip } from "recharts";
import { EyeOff, BarChart3 } from "lucide-react";
import { Wordmark } from "../components/Brand";
import { num, countryFlag, countryLabel } from "../utils";

const RANGES = [
  { value: "24h", label: "24 hours" },
  { value: "7d", label: "7 days" },
  { value: "30d", label: "30 days" },
];

type Row = { key: string; count: number };
type Panels = {
  totals: boolean;
  trend: boolean;
  pages: boolean;
  sources: boolean;
  countries: boolean;
  devices: boolean;
};
type Shared = {
  workspace: string;
  range: string;
  panels: Panels;
  pageviews: number;
  visitors: number;
  live: number;
  topPages: Row[];
  topReferrers: Row[];
  countries: Row[];
  devices: Row[];
  timeseries: { bucket: string; views: number; visitors: number }[];
};

const BASE = import.meta.env.VITE_API_BASE ?? "";

/** A ranked breakdown, with a bar showing each row's share of the top value. */
function Breakdown({
  title,
  rows,
  format,
  empty,
}: {
  title: string;
  rows: Row[];
  format?: (key: string) => React.ReactNode;
  empty: string;
}) {
  const max = rows.length ? Math.max(...rows.map((r) => r.count)) : 0;

  return (
    <Box className="surface-card" p="lg">
      <Text fw={650} size="sm" mb="md">{title}</Text>
      {rows.length === 0 ? (
        <Text size="xs" c="dimmed" py="lg" ta="center">{empty}</Text>
      ) : (
        <Stack gap={10}>
          {rows.slice(0, 8).map((r) => (
            <div key={r.key}>
              <Group justify="space-between" wrap="nowrap" gap="sm" mb={4}>
                <Text size="sm" truncate style={{ minWidth: 0 }}>
                  {format ? format(r.key) : r.key}
                </Text>
                <Text size="sm" c="dimmed" style={{ flexShrink: 0, fontVariantNumeric: "tabular-nums" }}>
                  {num(r.count)}
                </Text>
              </Group>
              <Progress
                value={max ? (r.count / max) * 100 : 0}
                size={3}
                radius="xl"
                color="emerald"
              />
            </div>
          ))}
        </Stack>
      )}
    </Box>
  );
}

/**
 * A workspace's public dashboard.
 *
 * Reached by share token, with no login and no app shell. It deliberately does
 * its own fetching rather than going through the authenticated RTK Query
 * client — that client attaches the viewer's bearer token, and this page must
 * work identically for someone who has never signed in.
 */
export default function PublicDashboard() {
  const { token } = useParams<{ token: string }>();
  const [range, setRange] = useState("30d");
  const [data, setData] = useState<Shared | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "missing">("loading");

  // Only the first load counts as a view — switching range re-fetches, and
  // counting that would inflate one reader into several.
  const counted = useRef(false);

  useEffect(() => {
    let cancelled = false;
    setState((s) => (s === "ready" ? "ready" : "loading"));

    const count = counted.current ? "" : "&count=1";
    counted.current = true;

    fetch(`${BASE}/api/share/${token}?range=${range}${count}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((d: Shared) => {
        if (!cancelled) {
          setData(d);
          setState("ready");
        }
      })
      .catch(() => {
        if (!cancelled) setState("missing");
      });

    // Refresh while the tab is open, so a dashboard left on a screen stays
    // current — this is what makes the "live" framing honest rather than a
    // snapshot that quietly goes stale.
    const poll = setInterval(() => {
      if (document.visibilityState !== "visible") return;
      fetch(`${BASE}/api/share/${token}?range=${range}`)
        .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
        .then((d: Shared) => {
          if (!cancelled) setData(d);
        })
        .catch(() => {});
    }, 30_000);

    return () => {
      cancelled = true;
      clearInterval(poll);
    };
  }, [token, range]);

  useEffect(() => {
    if (data) document.title = `${data.workspace} — Analytics`;
  }, [data]);

  if (state === "loading") {
    return (
      <Center mih="100vh" style={{ background: "var(--bg)" }}>
        <Loader size="sm" color="emerald" />
      </Center>
    );
  }

  // A revoked link and a wrong link look the same on purpose — telling them
  // apart would confirm which tokens exist.
  if (state === "missing" || !data) {
    return (
      <Center mih="100vh" style={{ background: "var(--bg)" }}>
        <Stack align="center" gap="sm" maw={340}>
          <ThemeIcon variant="light" color="gray" size={56} radius="md">
            <EyeOff size={26} />
          </ThemeIcon>
          <Text fw={600} mt={4}>This dashboard isn&apos;t available</Text>
          <Text c="dimmed" size="sm" ta="center">
            The link may have been turned off or replaced. Ask whoever shared it
            for an up-to-date link.
          </Text>
        </Stack>
      </Center>
    );
  }

  // The server omits data for panels the owner turned off; default to showing
  // everything so an older response without the field still renders.
  const p = data.panels ?? {
    totals: true, trend: true, pages: true, sources: true, countries: true, devices: true,
  };

  const breakdowns = [
    p.pages && { title: "Top pages", rows: data.topPages, empty: "No pageviews yet" },
    p.sources && { title: "Top sources", rows: data.topReferrers, empty: "No referrers yet" },
    p.countries && {
      title: "Countries",
      rows: data.countries,
      empty: "No location data yet",
      format: (k: string) => `${countryFlag(k)} ${countryLabel(k)}`,
    },
    p.devices && { title: "Devices", rows: data.devices, empty: "No device data yet" },
  ].filter(Boolean) as {
    title: string;
    rows: Row[];
    empty: string;
    format?: (k: string) => React.ReactNode;
  }[];

  return (
    <Box mih="100vh" style={{ background: "var(--bg)" }}>
      <Box className="pub-bar">
        <Group justify="space-between" wrap="wrap" gap="md" className="pub-inner">
          <Group gap="sm" wrap="nowrap" style={{ minWidth: 0 }}>
            <Box className="pub-mark">
              <BarChart3 size={17} />
            </Box>
            <div style={{ minWidth: 0 }}>
              <Title order={3} style={{ letterSpacing: "-0.02em" }} lineClamp={1}>
                {data.workspace}
              </Title>
              <Text size="xs" c="dimmed" mt={1}>
                Live analytics · updates automatically
              </Text>
            </div>
          </Group>

          <Box className="section-rail" style={{ flexShrink: 0 }}>
            {RANGES.map((r) => (
              <UnstyledButton
                key={r.value}
                className="section-tab"
                data-active={range === r.value}
                onClick={() => setRange(r.value)}
              >
                <Text size="sm" fw={range === r.value ? 600 : 500}>
                  {r.label}
                </Text>
              </UnstyledButton>
            ))}
          </Box>
        </Group>
      </Box>

      <Box className="pub-inner" py="xl">
        {/* Hero band: one big number, the rest as supporting context. Three
            equal tiles gave the page no focal point — nothing said "start
            here", so it read as a report rather than a dashboard. */}
        {p.totals && (
          <Box className="hero-band" mb="lg">
            {p.trend && data.timeseries.length > 1 && (
              <div className="hero-spark" aria-hidden="true">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.timeseries} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="pubHero" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity={0.2} />
                        <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Area
                      type="monotone"
                      dataKey="views"
                      stroke="#10b981"
                      strokeWidth={2}
                      strokeOpacity={0.5}
                      fill="url(#pubHero)"
                      dot={false}
                      isAnimationActive={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}

            <Box className="hero-content" p="xl">
              <Group justify="space-between" align="flex-start" wrap="wrap" gap="xl">
                <div style={{ minWidth: 0 }}>
                  <Group gap={8} mb={10} wrap="nowrap">
                    <span className="status-dot live" style={{ background: "#34d399" }} />
                    <Text size="xs" c="dimmed" fw={600} style={{ letterSpacing: "0.06em" }}>
                      ONLINE NOW
                    </Text>
                  </Group>
                  <Group align="baseline" gap="sm" wrap="nowrap">
                    <Text fw={700} fz={56} lh={1} style={{ letterSpacing: "-0.04em" }}>
                      {num(data.live)}
                    </Text>
                    <Text size="sm" c="dimmed" pb={8}>
                      {data.live === 1 ? "visitor" : "visitors"}
                    </Text>
                  </Group>
                </div>

                <Group gap="xl" wrap="wrap">
                  <div>
                    <Text size="xs" c="dimmed" fw={500} mb={4}>Visitors</Text>
                    <Text fw={650} fz={26} lh={1.1} style={{ letterSpacing: "-0.02em" }}>
                      {num(data.visitors)}
                    </Text>
                  </div>
                  <div>
                    <Text size="xs" c="dimmed" fw={500} mb={4}>Pageviews</Text>
                    <Text fw={650} fz={26} lh={1.1} style={{ letterSpacing: "-0.02em" }}>
                      {num(data.pageviews)}
                    </Text>
                  </div>
                </Group>
              </Group>
            </Box>
          </Box>
        )}

        {/* The hero already carries the trend as backdrop when totals are on;
            a second copy of the same curve directly beneath it is noise. */}
        {p.trend && !p.totals && data.timeseries.length > 1 && (
          <Box className="surface-card" p="lg" mb="lg">
            <Text fw={650} size="sm" mb="md">Traffic</Text>
            <div style={{ height: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.timeseries} margin={{ top: 4, right: 4, left: 4, bottom: 0 }}>
                  <defs>
                    <linearGradient id="pubArea" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity={0.22} />
                      <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="bucket"
                    tick={{ fontSize: 11, fill: "var(--muted)" }}
                    axisLine={false}
                    tickLine={false}
                    minTickGap={40}
                  />
                  <RTooltip
                    contentStyle={{
                      background: "var(--surface)",
                      border: "1px solid var(--border)",
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="views"
                    name="Pageviews"
                    stroke="#10b981"
                    strokeWidth={2}
                    fill="url(#pubArea)"
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Box>
        )}

        {breakdowns.length > 0 && (
          <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
            {breakdowns.map((b) => (
              <Breakdown
                key={b.title}
                title={b.title}
                rows={b.rows}
                empty={b.empty}
                format={b.format}
              />
            ))}
          </SimpleGrid>
        )}

        {/* Attribution: every shared dashboard is this product in front of
            someone who does not have it. */}
        <Center mt="xl" pt="lg" style={{ borderTop: "1px solid var(--border)" }}>
          <Group gap={8}>
            <Text size="xs" c="dimmed">Powered by</Text>
            <a href="https://quantalog.daorbit.in" target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}>
              <Wordmark />
            </a>
          </Group>
        </Center>
      </Box>
    </Box>
  );
}
