import { Link } from "react-router-dom";
import { Button, Card, Center, Group, Stack, Text } from "@mantine/core";
import { ArrowUpRight, Flag, Plus } from "lucide-react";
import { Rings } from "@/features/goals/components/ProgressRing";
import { TargetBar } from "@/features/goals/components/TargetBar";
import { useTargets } from "@/features/goals/hooks/useTargets";
import { formatMetric, targetStatus } from "@/features/goals/metrics";
import { RING_PALETTE } from "@/features/goals/tones";
import classes from "@/features/goals/components/Goals.module.css";

export function TargetsWidget({ workspaceId }: { workspaceId: string }) {
  const { targets } = useTargets(workspaceId);
  const achieved = targets.filter((t) => t.achieved).length;
  const featured = targets.slice(0, 3);

  return (
    <Card withBorder radius="lg" padding="lg" h="100%">
      <Group justify="space-between" mb="md" wrap="nowrap">
        <Group gap={8} wrap="nowrap">
          <Flag size={15} className="sect-ic" />
          <Text fw={600} c="dimmed" size="sm">Goal progress</Text>
          {targets.length > 0 && <Text size="xs" c="dimmed">{achieved}/{targets.length} hit</Text>}
        </Group>
        <Button component={Link} to="/app/goals" variant="subtle" size="xs" rightSection={<ArrowUpRight size={14} />}>
          Manage
        </Button>
      </Group>

      {targets.length === 0 ? (
        <Center py="md">
          <Stack align="center" gap={10}>
            <Rings
              size={72}
              stroke={7}
              gap={3}
              rings={[
                { value: 0.7, tone: RING_PALETTE[0] },
                { value: 0.5, tone: RING_PALETTE[1] },
                { value: 0.3, tone: RING_PALETTE[2] },
              ]}
            />
            <Text size="xs" c="dimmed" ta="center" maw={240}>
              Set a monthly or quarterly target and watch it fill up here.
            </Text>
            <Button component={Link} to="/app/goals" size="xs" variant="light" radius="xl" leftSection={<Plus size={13} />}>
              Set a goal
            </Button>
          </Stack>
        </Center>
      ) : (
        <div className={classes.widgetRings}>
          <Rings size={104} stroke={10} gap={3} rings={featured.map((t, i) => ({ value: t.progress, tone: RING_PALETTE[i] }))} />
          <div className={classes.widgetList}>
            {targets.slice(0, 5).map((t) => {
              const status = targetStatus(t);
              return (
                <div key={t.id} className={classes.widgetRow}>
                  <div className={classes.widgetRowHead}>
                    <span className={classes.dot} data-status={status} />
                    <span className={classes.widgetName} title={t.name}>{t.name}</span>
                    {t.status === "ok" ? (
                      <span className={classes.widgetValue}>
                        <b>{formatMetric(t.metric, t.current ?? 0, true)}</b> / {formatMetric(t.metric, t.target, true)}
                      </span>
                    ) : (
                      <span className={classes.widgetValue}>Needs setup</span>
                    )}
                  </div>
                  <TargetBar size="sm" progress={t.progress} status={status} pace={t.direction === "above" ? t.elapsed : null} />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </Card>
  );
}
