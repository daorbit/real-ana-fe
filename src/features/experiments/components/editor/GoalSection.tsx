import { SegmentedControl, TextInput } from "@mantine/core";
import { StudioSection } from "@/features/popups/components/studio/StudioSection";
import { GOAL_TYPE_OPTIONS } from "@/features/experiments/lib/experimentLabels";
import type { ExperimentInput } from "@/features/experiments/types";

interface Props {
  draft: ExperimentInput;
  onChange: (patch: Partial<ExperimentInput>) => void;
}

export function GoalSection({ draft, onChange }: Props) {
  const isPage = draft.goal.type === "page";
  return (
    <StudioSection step={3} title="What counts as a win" description="A visitor converts when they reach this after seeing the test." done={Boolean(draft.goal.value.trim())}>
      <SegmentedControl
        fullWidth
        data={GOAL_TYPE_OPTIONS}
        value={draft.goal.type}
        onChange={(type) => onChange({ goal: { type: type as "page" | "event", value: "" } })}
      />
      <TextInput
        label={isPage ? "Goal page" : "Event name"}
        description={isPage ? "For example the thank-you or signup page." : "A custom event you already track with rta.track()."}
        placeholder={isPage ? "/thank-you" : "signup_completed"}
        maxLength={200}
        value={draft.goal.value}
        onChange={(e) => onChange({ goal: { ...draft.goal, value: e.currentTarget.value.trim() } })}
      />
    </StudioSection>
  );
}
