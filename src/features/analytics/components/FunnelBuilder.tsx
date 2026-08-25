import { useMemo, useState } from "react";
import {
  Card, Group, Text, Stack, Button, Select, ActionIcon, Progress, Badge,
  Center, ThemeIcon, Loader, SegmentedControl, Chip,
} from "@mantine/core";
import { Plus, Trash2, Filter, Play, TrendingDown, List, Waypoints, ListChecks } from "lucide-react";
import { useComputeFunnelMutation } from "@/app/store";
import { notify, errMessage } from "@/shared/lib/notify";
import { num } from "@/shared/lib";
import { FunnelFlowView } from "@/features/analytics/components/FunnelFlowView";
import type { Stats, FunnelStepInput, FunnelResultStep } from "@/shared/types";

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
  sites,
}: {
  workspaceId: string;
  range: string;
  stats: Stats | null;
  /** siteIds to scope to; empty/undefined means every site. */
  sites?: string[];
}) {
  const [steps, setSteps] = useState<Draft[]>([
    { type: "page", value: "" },
    { type: "page", value: "" },
  ]);
  const [result, setResult] = useState<FunnelResultStep[] | null>(null);
  const [view, setView] = useState<"list" | "flow">("list");
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [run, { isLoading }] = useComputeFunnelMutation();

  // Options come from what the dashboard already surfaced, so the picker only
  // offers steps that actually have data behind them.
  const pageOptions = (stats?.topPages ?? []).map((p) => ({ value: p.key, label: p.key }));
  const eventOptions = (stats?.customEvents ?? []).map((e) => ({ value: e.key, label: e.key }));

  // Ready-made funnels built from whatever the account already has traffic
  // for, so a first-time user gets a useful chart in one click instead of
  // guessing which pages or events are worth chaining together.
  const presets = useMemo(() => {
    const list: { key: string; label: string; steps: Draft[] }[] = [];

    const entry = stats?.entryPages?.[0]?.key;
    const topPages = (stats?.topPages ?? []).map((p) => p.key).filter((p) => p !== entry);
    const events = [...(stats?.customEvents ?? [])].sort((a, b) => b.count - a.count);
    const goals = stats?.goals ?? [];

    // Landing page into whatever else people actually visit next.
    if (entry && topPages.length > 0) {
      list.push({
        key: "landing-depth",
        label: `${entry} → ${topPages[0]}`,
        steps: [
          { type: "page", value: entry },
          { type: "page", value: topPages[0] },
        ],
      });
    }

    // Entry page into each configured goal — the funnel a goal implies but
    // nobody built yet.
    for (const g of goals.slice(0, 2)) {
      if (!entry) break;
      if (g.kind === "page" && g.match === entry) continue;
      list.push({
        key: `goal-${g.id}`,
        label: `${entry} → ${g.name}`,
        steps: [
          { type: "page", value: entry },
          { type: g.kind, value: g.match },
        ],
      });
    }

    // The two busiest custom events, chained in the order they'd naturally
    // occur (more common → less common).
    if (events.length >= 2) {
      list.push({
        key: "top-events",
        label: `${events[0].key} → ${events[1].key}`,
        steps: [
          { type: "event", value: events[0].key },
          { type: "event", value: events[1].key },
        ],
      });
    }

    // The three most-visited pages, in traffic order, as a generic path.
    if (topPages.length >= 2) {
      list.push({
        key: "top-pages",
        label: `Top ${Math.min(3, topPages.length)} pages`,
        steps: topPages.slice(0, 3).map((v) => ({ type: "page" as const, value: v })),
      });
    }

    return list;
  }, [stats]);

  const setStep = (i: number, patch: Partial<Draft>) => {
    setActivePreset(null);
    setSteps((s) => s.map((st, idx) => (idx === i ? { ...st, ...patch } : st)));
  };
  const addStep = () => {
    setActivePreset(null);
    setSteps((s) => [...s, { type: "page", value: "" }]);
  };
  const removeStep = (i: number) => {
    setActivePreset(null);
    setSteps((s) => s.filter((_, idx) => idx !== i));
  };

  const valid = steps.filter((s) => s.value).length >= 2;

  const compute = async (payloadSteps?: Draft[]) => {
    const payload: FunnelStepInput[] = (payloadSteps ?? steps).filter((s) => s.value);
    if (payload.length < 2) return;
    try {
      const res = await run({ workspaceId, steps: payload, range, sites }).unwrap();
      setResult(res.steps);
    } catch (e) {
      notify.error(errMessage(e, "Could not compute the funnel."));
    }
  };

  const runPreset = (preset: (typeof presets)[number]) => {
    setActivePreset(preset.key);
    setSteps(preset.steps);
    compute(preset.steps);
  };

  const top = result?.[0]?.count ?? 0;

  return (
    <Stack gap="lg">
      {presets.length > 0 && (
        <Card withBorder radius="lg" padding="lg">
          <Group gap={8} mb="sm">
            <ListChecks size={15} className="sect-ic" />
            <Text fw={600} c="dimmed" size="sm">Quick funnels</Text>
          </Group>
          <Group gap="xs">
            {presets.map((p) => (
              <Chip
                key={p.key}
                checked={activePreset === p.key}
                onChange={() => runPreset(p)}
                variant="light"
                color="emerald"
                disabled={isLoading}
              >
                {p.label}
              </Chip>
            ))}
          </Group>
        </Card>
      )}

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
            onClick={() => compute()}
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
            <Group gap="sm">
              <Badge variant="light" color="emerald" size="lg">
                {result[result.length - 1]?.rate ?? 0}% end-to-end
              </Badge>
              <SegmentedControl
                size="xs"
                value={view}
                onChange={(v) => setView(v as "list" | "flow")}
                data={[
                  { value: "list", label: <List size={13} /> },
                  { value: "flow", label: <Waypoints size={13} /> },
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
