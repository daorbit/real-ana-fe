import { Link } from "react-router-dom";
import { Button, Card, Group, Stack, Text } from "@mantine/core";
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis, CartesianGrid } from "recharts";
import { ArrowUpRight, Plus } from "lucide-react";
import { AnalyticsArt } from "@/shared/ui/Brand";
import type { Stats } from "@/shared/types";

const TOOLTIP_STYLE = { background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 };
const LABEL_STYLE = { color: "var(--muted)" };

export function TrafficCard({
  stats,
  title = "Traffic — last 24h",
  embedded = false,
}: {
  stats: Partial<Stats> | null;
  title?: string;
  embedded?: boolean;
}) {
  const series = stats?.timeseries ?? [];
  const hasData = (stats?.pageviews ?? 0) > 0;

  return (
    <Card withBorder radius="lg" padding="lg" h="100%">
      <Group justify="space-between" mb="md">
        <Text fw={600} size="sm" c="dimmed">{title}</Text>
        {!embedded && (
          <Button component={Link} to="/app/analytics" variant="subtle" size="xs" rightSection={<ArrowUpRight size={14} />}>
            Details
          </Button>
        )}
      </Group>
      {hasData ? (
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={series} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="hg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.45} />
                <stop offset="100%" stopColor="var(--accent-2)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="bucket" tick={{ fontSize: 11, fill: "var(--muted)" }} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={TOOLTIP_STYLE} labelStyle={LABEL_STYLE} />
            <Area type="monotone" dataKey="views" stroke="var(--accent)" strokeWidth={2.5} fill="url(#hg)" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      ) : embedded ? (
        <Stack align="center" gap="xs" py="xl">
          <Text fw={600} size="sm">No traffic in this period</Text>
        </Stack>
      ) : (
        <Stack align="center" gap="xs" py="md">
          <AnalyticsArt />
          <Text fw={600} size="sm" mt="sm">No traffic yet</Text>
          <Text c="dimmed" size="xs" ta="center" maw={340}>
            Install the tracking snippet on a site and live visitors will appear here.
          </Text>
          <Button component={Link} to="/app/workspaces" size="xs" variant="light" mt={6} leftSection={<Plus size={14} />}>
            Get tracking snippet
          </Button>
        </Stack>
      )}
    </Card>
  );
}
