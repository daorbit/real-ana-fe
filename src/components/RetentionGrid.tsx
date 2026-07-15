import { Card, Group, Text, Stack, Center, ThemeIcon, Loader } from "@mantine/core";
import { Repeat, Inbox } from "lucide-react";
import { useGetRetentionQuery } from "../store";
import { num } from "../utils";

/** Colour a retention cell from empty (0%) to strong (100%). */
function cellStyle(pct: number): React.CSSProperties {
  // Emerald with opacity scaled to the percentage, so a denser cell = stickier.
  const alpha = pct === 0 ? 0 : 0.12 + (pct / 100) * 0.66;
  return {
    background:
      pct === 0
        ? "var(--surface)"
        : `color-mix(in srgb, var(--mantine-color-emerald-6) ${Math.round(alpha * 100)}%, transparent)`,
    color: pct >= 55 ? "#04150e" : "var(--mantine-color-text)",
  };
}

/**
 * Weekly retention cohorts as a triangular heatmap. Each row is the group of
 * visitors first seen in one week; each cell shows the share still active N
 * weeks later. Warmer cells = stickier cohorts.
 */
export function RetentionGrid({ workspaceId }: { workspaceId: string }) {
  const { data, isLoading } = useGetRetentionQuery({ workspaceId, weeks: 6 });

  const weeks = data?.weeks ?? 6;
  const cohorts = data?.cohorts ?? [];
  const hasData = cohorts.some((c) => c.size > 0);

  return (
    <Card withBorder radius="lg" padding="lg">
      <Group justify="space-between" mb="md">
        <Group gap={8}>
          <Repeat size={15} className="sect-ic" />
          <Text fw={600} c="dimmed" size="sm">Weekly retention</Text>
        </Group>
        <Text size="xs" c="dimmed">Share of each cohort active in later weeks</Text>
      </Group>

      {isLoading ? (
        <Center py="xl"><Loader size="sm" color="emerald" /></Center>
      ) : !hasData ? (
        <Center py="xl">
          <Stack align="center" gap="xs" maw={380}>
            <ThemeIcon variant="light" color="gray" size="md" radius="md">
              <Inbox size={16} />
            </ThemeIcon>
            <Text c="dimmed" size="xs" ta="center">
              Not enough history yet. Retention needs visitors returning across
              several weeks — check back once the site has run for a while.
            </Text>
          </Stack>
        </Center>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table className="retention-table">
            <thead>
              <tr>
                <th className="ret-head">Cohort</th>
                <th className="ret-head">Visitors</th>
                {Array.from({ length: weeks }, (_, i) => (
                  <th key={i} className="ret-head ret-week">W{i}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {cohorts.map((c) => (
                <tr key={c.cohort}>
                  <td className="ret-label">Week {c.cohort + 1}</td>
                  <td className="ret-size">{num(c.size)}</td>
                  {Array.from({ length: weeks }, (_, i) => {
                    const pct = c.retention[i];
                    // A cohort can only be measured up to the present week.
                    const measurable = i <= weeks - 1 - c.cohort;
                    if (!measurable || pct == null) {
                      return <td key={i} className="ret-cell ret-empty" />;
                    }
                    return (
                      <td key={i} className="ret-cell" style={cellStyle(pct)}>
                        {pct}%
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
