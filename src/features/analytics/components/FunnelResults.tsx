import {
  Card, Group, Text, Stack, Progress, Badge, Center, ThemeIcon, SegmentedControl,
} from "@mantine/core";
import { TrendingDown, List, Waypoints, TriangleRight } from "lucide-react";
import { num } from "@/shared/lib";
import { FunnelFlowView } from "@/features/analytics/components/FunnelFlowView";
import { FunnelShapeView } from "@/features/analytics/components/FunnelShapeView";
import type { FunnelResultStep } from "@/shared/types";

/** Computed funnel results, switchable between list, shape, and flow views. */
export function FunnelResults({
  result,
  view,
  onViewChange,
}: {
  result: FunnelResultStep[];
  view: "list" | "flow" | "shape";
  onViewChange: (v: "list" | "flow" | "shape") => void;
}) {
  const top = result[0]?.count ?? 0;

  return (
    <Card withBorder radius="lg" padding="lg">
      <Group justify="space-between" mb="md">
        <Text fw={600} c="dimmed" size="sm">Results</Text>
        <Group gap="sm">
          <Badge variant="light" color="emerald" size="lg">
            {result[result.length - 1]?.rate ?? 0}% end-to-end
          </Badge>
          <SegmentedControl
            size="xs"
            value={view}
            onChange={(v) => onViewChange(v as "list" | "flow" | "shape")}
            data={[
              { value: "list", label: <Center><List size={13} /></Center> },
              { value: "shape", label: <Center><TriangleRight size={13} /></Center> },
              { value: "flow", label: <Center><Waypoints size={13} /></Center> },
            ]}
          />
        </Group>
      </Group>

      {top === 0 ? (
        <Center py="lg">
          <Text c="dimmed" size="sm">No sessions entered this funnel in the selected range.</Text>
        </Center>
      ) : view === "flow" ? (
        <FunnelFlowView steps={result} />
      ) : view === "shape" ? (
        <FunnelShapeView steps={result} />
      ) : (
        <Stack gap="lg">
          {result.map((step, i) => (
            <div key={i}>
              <Group justify="space-between" gap="xs" mb={5} wrap="nowrap">
                <Group gap={8} wrap="nowrap" style={{ minWidth: 0 }}>
                  <ThemeIcon variant="light" color="emerald" radius="xl" size="sm">
                    <Text size="xs" fw={700}>{i + 1}</Text>
                  </ThemeIcon>
                  <Text size="sm" truncate>{step.label}</Text>
                  <Badge variant="light" color="gray" size="xs">{step.type}</Badge>
                </Group>
                <Group gap={10} wrap="nowrap">
                  {i > 0 && step.dropFromPrev > 0 && (
                    <Text size="xs" c="pink" style={{ display: "inline-flex", alignItems: "center", gap: 3 }}>
                      <TrendingDown size={12} /> {step.dropFromPrev}%
                    </Text>
                  )}
                  <Text size="xs" c="dimmed">{step.rate}%</Text>
                  <Text size="sm" fw={700}>{num(step.count)}</Text>
                </Group>
              </Group>
              <Progress value={step.rate} size="lg" radius="sm" color="emerald" />
            </div>
          ))}
        </Stack>
      )}
    </Card>
  );
}
