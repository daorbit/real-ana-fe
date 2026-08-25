import { Card, Group, Text, Stack, Button, Select, ActionIcon, ThemeIcon, Loader, Divider } from "@mantine/core";
import { Plus, Trash2, Filter, Play, Save } from "lucide-react";

export type Draft = { type: "page" | "event"; value: string };

/** The ordered list of funnel steps, plus the add/save/compute action bar. */
export function FunnelStepEditor({
  steps,
  pageOptions,
  eventOptions,
  valid,
  isLoading,
  editingId,
  onStepChange,
  onAddStep,
  onRemoveStep,
  onSave,
  onCompute,
}: {
  steps: Draft[];
  pageOptions: { value: string; label: string }[];
  eventOptions: { value: string; label: string }[];
  valid: boolean;
  isLoading: boolean;
  editingId: string | null;
  onStepChange: (i: number, patch: Partial<Draft>) => void;
  onAddStep: () => void;
  onRemoveStep: (i: number) => void;
  onSave: () => void;
  onCompute: () => void;
}) {
  return (
    <Card withBorder radius="lg" padding="lg">
      <Group gap={8} mb="md">
        <Filter size={15} className="sect-ic" />
        <Text fw={600} c="dimmed" size="sm">Build a funnel</Text>
      </Group>

      <Stack gap={6}>
        {steps.map((s, i) => (
          <Group
            key={i}
            gap="sm"
            wrap="nowrap"
            px="sm"
            py={6}
            className="funnel-step-row"
            style={{
              borderRadius: 10,
              border: "1px solid var(--mantine-color-default-border)",
              transition: "background 100ms ease",
            }}
          >
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
              onChange={(v) => onStepChange(i, { type: (v as "page" | "event") ?? "page", value: "" })}
              allowDeselect={false}
            />
            <Select
              flex={1}
              size="sm"
              placeholder={s.type === "page" ? "Choose a page…" : "Choose an event…"}
              data={s.type === "page" ? pageOptions : eventOptions}
              value={s.value || null}
              onChange={(v) => onStepChange(i, { value: v ?? "" })}
              searchable
              nothingFoundMessage="No data for this dimension yet"
              comboboxProps={{ withinPortal: true }}
            />
            <ActionIcon
              variant="subtle"
              color="red"
              onClick={() => onRemoveStep(i)}
              disabled={steps.length <= 2}
              title="Remove step"
            >
              <Trash2 size={15} />
            </ActionIcon>
          </Group>
        ))}
      </Stack>

      <Divider my="md" />

      <Group justify="space-between">
        <Button
          variant="subtle"
          size="xs"
          leftSection={<Plus size={14} />}
          onClick={onAddStep}
          disabled={steps.length >= 8}
        >
          Add step
        </Button>
        <Group gap="xs">
          <Button
            variant="default"
            size="sm"
            leftSection={<Save size={14} />}
            onClick={onSave}
            disabled={!valid}
          >
            {editingId ? "Update" : "Save"}
          </Button>
          <Button
            size="sm"
            leftSection={isLoading ? <Loader size={14} color="white" /> : <Play size={15} />}
            onClick={onCompute}
            disabled={!valid || isLoading}
          >
            Compute funnel
          </Button>
        </Group>
      </Group>
    </Card>
  );
}
