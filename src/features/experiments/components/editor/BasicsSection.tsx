import { Select, SegmentedControl, Text, TextInput } from "@mantine/core";
import { StudioSection } from "@/features/popups/components/studio/StudioSection";
import { TYPE_OPTIONS } from "@/features/experiments/lib/experimentLabels";
import type { ExperimentInput, ExperimentType } from "@/features/experiments/types";
import type { Site } from "@/shared/types";

interface Props {
  draft: ExperimentInput;
  sites: Site[];
  onChange: (patch: Partial<ExperimentInput>) => void;
}

export function BasicsSection({ draft, sites, onChange }: Props) {
  const hint = TYPE_OPTIONS.find((t) => t.value === draft.type)?.hint ?? "";
  return (
    <StudioSection step={1} title="What you are testing" description="Name the test and pick how the variant is shown." done={Boolean(draft.name.trim() && draft.siteId)}>
      <TextInput
        label="Name"
        placeholder="Pricing page headline"
        maxLength={80}
        value={draft.name}
        onChange={(e) => onChange({ name: e.currentTarget.value })}
      />
      <Select
        label="Site"
        data={sites.map((s) => ({ value: s.siteId, label: s.name }))}
        value={draft.siteId || null}
        onChange={(value) => value && onChange({ siteId: value })}
        allowDeselect={false}
      />
      <div>
        <SegmentedControl
          fullWidth
          data={TYPE_OPTIONS.map(({ value, label }) => ({ value, label }))}
          value={draft.type}
          onChange={(value) => onChange({ type: value as ExperimentType })}
        />
        <Text size="xs" c="dimmed" mt={6}>
          {hint}
        </Text>
      </div>
      {draft.type === "code" && (
        <TextInput
          label="Test key"
          description="Your developer passes this to rta.variant(). Letters, numbers and dashes."
          placeholder="pricing-headline"
          maxLength={40}
          value={draft.key}
          onChange={(e) => onChange({ key: e.currentTarget.value.toLowerCase().replace(/[^a-z0-9-]/g, "-") })}
        />
      )}
    </StudioSection>
  );
}
