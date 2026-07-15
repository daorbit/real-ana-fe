import { useState } from "react";
import {
  Card, Group, Text, Stack, Button, Select, ActionIcon, Progress, Badge,
  Center, ThemeIcon, Loader,
} from "@mantine/core";
import { Plus, Trash2, Filter, Play, TrendingDown } from "lucide-react";
import { useComputeFunnelMutation } from "../store";
import { notify, errMessage } from "../notify";
import { num } from "../utils";
import type { Stats, FunnelStepInput, FunnelResultStep } from "../types";

type Draft = { type: "page" | "event"; value: string };

/**
 * Ad-hoc funnel builder. The user picks an ordered list of steps — pages or
 * custom events, drawn from what the current stats already know about — and we
 * ask the backend for per-step drop-off across sessions.
 */
export function FunnelBuilder({
  workspaceId,
  range,
  stats,
}: {
  workspaceId: string;
  range: string;
  stats: Stats | null;
}) {
  const [steps, setSteps] = useState<Draft[]>([
    { type: "page", value: "" },
    { type: "page", value: "" },
  ]);
  const [result, setResult] = useState<FunnelResultStep[] | null>(null);
  const [run, { isLoading }] = useComputeFunnelMutation();

  // Options come from what the dashboard already surfaced, so the picker only
  // offers steps that actually have data behind them.
  const pageOptions = (stats?.topPages ?? []).map((p) => ({ value: p.key, label: p.key }));
  const eventOptions = (stats?.customEvents ?? []).map((e) => ({ value: e.key, label: e.key }));

  const setStep = (i: number, patch: Partial<Draft>) =>
    setSteps((s) => s.map((st, idx) => (idx === i ? { ...st, ...patch } : st)));
  const addStep = () => setSteps((s) => [...s, { type: "page", value: "" }]);
  const removeStep = (i: number) => setSteps((s) => s.filter((_, idx) => idx !== i));

  const valid = steps.filter((s) => s.value).length >= 2;

  const compute = async () => {
    const payload: FunnelStepInput[] = steps.filter((s) => s.value);
    if (payload.length < 2) return;
    try {
      const res = await run({ workspaceId, steps: payload, range }).unwrap();
      setResult(res.steps);
    } catch (e) {
      notify.error(errMessage(e, "Could not compute the funnel."));
    }
  };

  const top = result?.[0]?.count ?? 0;

  return (
    <Stack gap="lg">
      <Card withBorder radius="lg" padding="lg">
        <Group gap={8} mb="md">
          <Filter size={15} className="sect-ic" />
          <Text fw={600} c="dimmed" size="sm">Build a funnel</Text>
        </Group>

        <Stack gap="sm">
          {steps.map((s, i) => (
            <Group key={i} gap="sm" wrap="nowrap">
              <ThemeIcon variant="light" color="gray" radius="xl" size="sm">
                <Text size="xs" fw={700}>{i + 1}</Text>
              </ThemeIcon>
              <Select
                w={110}
                size="sm"
                data={[
                  { value: "page", label: "Page" },
                  { value: "event", label: "Event" },
                ]}
                value={s.type}
                onChange={(v) => setStep(i, { type: (v as "page" | "event") ?? "page", value: "" })}
                allowDeselect={false}
              />
              <Select
                flex={1}
                size="sm"
                placeholder={s.type === "page" ? "Choose a page…" : "Choose an event…"}
                data={s.type === "page" ? pageOptions : eventOptions}
                value={s.value || null}
                onChange={(v) => setStep(i, { value: v ?? "" })}
                searchable
                nothingFoundMessage="No data for this dimension yet"
                comboboxProps={{ withinPortal: true }}
              />
              <ActionIcon
                variant="subtle"
                color="red"
                onClick={() => removeStep(i)}
                disabled={steps.length <= 2}
                title="Remove step"
              >
                <Trash2 size={15} />
              </ActionIcon>
            </Group>
          ))}
        </Stack>

        <Group justify="space-between" mt="md">
          <Button
            variant="subtle"
            size="xs"
            leftSection={<Plus size={14} />}
            onClick={addStep}
            disabled={steps.length >= 8}
          >
            Add step
          </Button>
          <Button
            size="sm"
            leftSection={isLoading ? <Loader size={14} color="white" /> : <Play size={15} />}
            onClick={compute}
            disabled={!valid || isLoading}
          >
            Compute funnel
          </Button>
        </Group>
      </Card>

      {result && result.length > 0 && (
        <Card withBorder radius="lg" padding="lg">
          <Group justify="space-between" mb="md">
            <Text fw={600} c="dimmed" size="sm">Results</Text>
            <Badge variant="light" color="emerald" size="lg">
              {result[result.length - 1]?.rate ?? 0}% end-to-end
            </Badge>
          </Group>

          {top === 0 ? (
            <Center py="lg">
              <Text c="dimmed" size="sm">No sessions entered this funnel in the selected range.</Text>
            </Center>
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
      )}
    </Stack>
  );
}
