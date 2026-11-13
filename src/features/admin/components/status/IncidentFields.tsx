import { Checkbox, Group, SegmentedControl, Stack, Text, TextInput } from "@mantine/core";
import { COMPONENT_OPTIONS, IMPACT_OPTIONS } from "../../status/labels";
import type { IncidentImpact, StatusComponentId } from "../../status/types";

export function IncidentFields({
  title,
  impact,
  components,
  onChange,
}: {
  title: string;
  impact: IncidentImpact;
  components: StatusComponentId[];
  onChange: (patch: { title?: string; impact?: IncidentImpact; components?: StatusComponentId[] }) => void;
}) {
  const hint = IMPACT_OPTIONS.find((o) => o.value === impact)?.hint;
  return (
    <>
      <TextInput
        label="Title"
        placeholder="Elevated errors on the dashboard"
        maxLength={160}
        value={title}
        onChange={(e) => onChange({ title: e.currentTarget.value })}
      />
      <Stack gap={6}>
        <Text size="sm" fw={500}>
          Impact
        </Text>
        <SegmentedControl
          value={impact}
          onChange={(value) => onChange({ impact: value as IncidentImpact })}
          data={IMPACT_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
        />
        {hint && (
          <Text size="xs" c="dimmed">
            {hint}
          </Text>
        )}
      </Stack>
      <Checkbox.Group label="Affected parts" value={components} onChange={(value) => onChange({ components: value as StatusComponentId[] })}>
        <Group gap="md" mt={6}>
          {COMPONENT_OPTIONS.map((o) => (
            <Checkbox key={o.value} value={o.value} label={o.label} />
          ))}
        </Group>
      </Checkbox.Group>
    </>
  );
}
