import { useEffect, useState } from "react";
import {
  Modal, Stack, TextInput, NumberInput, SegmentedControl, Select, Group, Button, Text, UnstyledButton,
} from "@mantine/core";
import { useGetGoalsQuery } from "@/app/store";
import { useSites } from "@/features/workspace";
import { useDemo } from "@/features/demo/context";
import { demoGoals } from "@/features/demo/demoData";
import { METRICS, METRIC_MAP, suggestName } from "@/features/goals/metrics";
import type { TargetInput, TargetMetric, TargetPeriod } from "@/features/goals/types";
import classes from "@/features/goals/components/Goals.module.css";

const EMPTY: TargetInput = { name: "", metric: "visitors", target: 10_000, period: "month", siteId: "", goalId: null };

export function TargetFormModal({
  opened,
  workspaceId,
  initial,
  editing,
  saving,
  onClose,
  onSubmit,
}: {
  opened: boolean;
  workspaceId: string;
  initial: Partial<TargetInput> | null;
  editing: boolean;
  saving: boolean;
  onClose: () => void;
  onSubmit: (input: TargetInput) => void;
}) {
  const [form, setForm] = useState<TargetInput>(EMPTY);
  const [nameTouched, setNameTouched] = useState(false);
  const { sites } = useSites(workspaceId);
  const { demo } = useDemo();
  const { data: realGoals = [] } = useGetGoalsQuery(workspaceId, { skip: !opened });
  const goals = demo ? demoGoals : realGoals;

  useEffect(() => {
    if (!opened) return;
    setForm({ ...EMPTY, ...initial });
    setNameTouched(Boolean(editing && initial?.name));
  }, [opened, initial, editing]);

  const meta = METRIC_MAP[form.metric];
  const name = nameTouched ? form.name : suggestName(form.metric, form.target, form.period);

  const pickMetric = (metric: TargetMetric) =>
    setForm((f) => ({
      ...f,
      metric,
      target: f.metric === metric ? f.target : METRIC_MAP[metric].placeholder,
      goalId: metric === "conversions" ? f.goalId : null,
    }));

  const valid =
    name.trim().length > 0 &&
    form.target > 0 &&
    (form.metric !== "conversions" || Boolean(form.goalId));

  const submit = () => {
    if (!valid) return;
    onSubmit({ ...form, name: name.trim() });
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={<Text fw={650}>{editing ? "Edit goal" : "New goal"}</Text>}
      size="lg"
      radius="lg"
      centered
    >
      <Stack gap="lg">
        <div>
          <Text size="sm" fw={500} mb={8}>What are you measuring?</Text>
          <div className={classes.metricGrid}>
            {METRICS.map((m) => (
              <UnstyledButton
                key={m.value}
                className={classes.metricOption}
                data-active={form.metric === m.value || undefined}
                onClick={() => pickMetric(m.value)}
              >
                <span className={classes.metricIcon}><m.icon size={15} /></span>
                <span className={classes.metricOptionLabel}>{m.label}</span>
              </UnstyledButton>
            ))}
          </div>
          <Text size="xs" c="dimmed" mt={8}>{meta.description}</Text>
        </div>

        {form.metric === "conversions" && (
          <Select
            label="Conversion goal"
            placeholder={goals.length ? "Pick a goal" : "Create a conversion goal in Analytics first"}
            data={goals.map((g) => ({ value: g.id, label: `${g.name} (${g.match})` }))}
            value={form.goalId ?? null}
            onChange={(v) => setForm((f) => ({ ...f, goalId: v }))}
            disabled={goals.length === 0}
            allowDeselect={false}
          />
        )}

        <Group grow align="flex-start">
          <NumberInput
            label={meta.lowerIsBetter ? "Stay at or below" : "Target"}
            value={form.target}
            onChange={(v) => setForm((f) => ({ ...f, target: Number(v) || 0 }))}
            min={meta.lowerIsBetter ? 0.1 : 1}
            step={meta.lowerIsBetter ? 0.5 : 100}
            decimalScale={meta.lowerIsBetter ? 1 : 0}
            thousandSeparator=","
            suffix={` ${meta.unit}`}
          />
          <div>
            <Text size="sm" fw={500} mb={6}>Period</Text>
            <SegmentedControl
              fullWidth
              color="emerald"
              value={form.period}
              onChange={(v) => setForm((f) => ({ ...f, period: v as TargetPeriod }))}
              data={[
                { label: "Monthly", value: "month" },
                { label: "Quarterly", value: "quarter" },
              ]}
            />
          </div>
        </Group>

        {meta.needsSite && sites.length > 1 && (
          <Select
            label="Site"
            data={[
              { value: "", label: "All sites" },
              ...sites.map((s) => ({ value: s.siteId, label: s.name })),
            ]}
            value={form.siteId ?? ""}
            onChange={(v) => setForm((f) => ({ ...f, siteId: v ?? "" }))}
            allowDeselect={false}
          />
        )}

        <TextInput
          label="Name"
          value={name}
          onChange={(e) => {
            setNameTouched(true);
            setForm((f) => ({ ...f, name: e.currentTarget.value }));
          }}
          maxLength={80}
        />

        {meta.lowerIsBetter && (
          <Text size="xs" c="dimmed">
            Position is read from Search Console over the last 28 days and counts as hit once it drops to your target or below.
          </Text>
        )}

        <Group justify="flex-end" gap="sm">
          <Button variant="subtle" color="gray" onClick={onClose}>Cancel</Button>
          <Button color="emerald" onClick={submit} loading={saving} disabled={!valid}>
            {editing ? "Save goal" : "Create goal"}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
