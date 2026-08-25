import { useMemo, useState } from "react";
import { Group, Stack, Modal, TextInput, Button, Card, Skeleton } from "@mantine/core";
import {
  useComputeFunnelMutation, useGetFunnelsQuery, useCreateFunnelMutation,
  useUpdateFunnelMutation, useDeleteFunnelMutation,
} from "@/app/store";
import { notify, errMessage } from "@/shared/lib/notify";
import { FunnelSidebar } from "@/features/analytics/components/FunnelSidebar";
import { FunnelStepEditor, type Draft } from "@/features/analytics/components/FunnelStepEditor";
import { FunnelResults } from "@/features/analytics/components/FunnelResults";
import { FlowGraphSkeleton } from "@/shared/ui/Skeletons";
import type { Stats, FunnelStepInput, FunnelResultStep } from "@/shared/types";

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
  const [view, setView] = useState<"list" | "flow" | "shape">("flow");
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saveOpen, setSaveOpen] = useState(false);
  const [saveName, setSaveName] = useState("");
  const [run, { isLoading }] = useComputeFunnelMutation();

  const { data: savedFunnels = [] } = useGetFunnelsQuery(workspaceId);
  const [createFunnel, { isLoading: isSaving }] = useCreateFunnelMutation();
  const [updateFunnel, { isLoading: isUpdating }] = useUpdateFunnelMutation();
  const [deleteFunnel] = useDeleteFunnelMutation();

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
    setEditingId(null);
    setSteps((s) => s.map((st, idx) => (idx === i ? { ...st, ...patch } : st)));
  };
  const addStep = () => {
    setActivePreset(null);
    setEditingId(null);
    setSteps((s) => [...s, { type: "page", value: "" }]);
  };
  const removeStep = (i: number) => {
    setActivePreset(null);
    setEditingId(null);
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
    setEditingId(null);
    setSteps(preset.steps);
    compute(preset.steps);
  };

  const loadSaved = (funnel: (typeof savedFunnels)[number]) => {
    setActivePreset(null);
    setEditingId(funnel.id);
    setSteps(funnel.steps);
    compute(funnel.steps);
  };

  const openSave = () => {
    setSaveName(editingId ? savedFunnels.find((f) => f.id === editingId)?.name ?? "" : "");
    setSaveOpen(true);
  };

  const confirmSave = async () => {
    const name = saveName.trim();
    if (!name) return;
    const payload: FunnelStepInput[] = steps.filter((s) => s.value);
    if (payload.length < 2) return;
    try {
      if (editingId) {
        await updateFunnel({ workspaceId, funnelId: editingId, name, steps: payload }).unwrap();
        notify.success("Funnel updated.");
      } else {
        const created = await createFunnel({ workspaceId, name, steps: payload }).unwrap();
        setEditingId(created.id);
        notify.success("Funnel saved.");
      }
      setSaveOpen(false);
    } catch (e) {
      notify.error(errMessage(e, "Could not save the funnel."));
    }
  };

  const removeSaved = async (funnelId: string) => {
    try {
      await deleteFunnel({ workspaceId, funnelId }).unwrap();
      if (editingId === funnelId) setEditingId(null);
    } catch (e) {
      notify.error(errMessage(e, "Could not delete the funnel."));
    }
  };

  return (
    <Group align="flex-start" wrap="nowrap" gap="lg">
      <FunnelSidebar
        savedFunnels={savedFunnels}
        presets={presets}
        editingId={editingId}
        activePreset={activePreset}
        disabled={isLoading}
        onLoadSaved={loadSaved}
        onRemoveSaved={removeSaved}
        onRunPreset={runPreset}
      />

      <Stack style={{ flex: 1, minWidth: 0 }} gap="lg">
        <FunnelStepEditor
          steps={steps}
          pageOptions={pageOptions}
          eventOptions={eventOptions}
          valid={valid}
          isLoading={isLoading}
          editingId={editingId}
          onStepChange={setStep}
          onAddStep={addStep}
          onRemoveStep={removeStep}
          onSave={openSave}
          onCompute={() => compute()}
        />

        <Modal opened={saveOpen} onClose={() => setSaveOpen(false)} title={editingId ? "Update funnel" : "Save funnel"} size="sm">
          <Stack gap="sm">
            <TextInput
              label="Name"
              placeholder="e.g. Signup funnel"
              value={saveName}
              onChange={(e) => setSaveName(e.currentTarget.value)}
              data-autofocus
            />
            <Group justify="flex-end">
              <Button variant="subtle" onClick={() => setSaveOpen(false)}>Cancel</Button>
              <Button
                onClick={confirmSave}
                loading={isSaving || isUpdating}
                disabled={!saveName.trim()}
              >
                {editingId ? "Update" : "Save"}
              </Button>
            </Group>
          </Stack>
        </Modal>

        {/* A recompute replaces the whole result, so the panel is a skeleton
            rather than stale numbers under a spinner. */}
        {isLoading ? (
          <Card withBorder radius="lg" padding="lg">
            <Group justify="space-between" mb="md">
              <Skeleton height={12} width={70} radius="sm" />
              <Skeleton height={26} width={140} radius="xl" />
            </Group>
            <FlowGraphSkeleton height={220} columns={[1, 1, 1, 1]} />
          </Card>
        ) : result && result.length > 0 ? (
          <FunnelResults result={result} view={view} onViewChange={setView} />
        ) : null}
      </Stack>
    </Group>
  );
}
