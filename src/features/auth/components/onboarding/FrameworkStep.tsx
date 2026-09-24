import { StepFooter } from "./StepFooter";
import { FrameworkPicker } from "@/features/workspace/components/FrameworkPicker";
import type { FrameworkId } from "@/features/workspace/frameworks";

/**
 * The step that asks what the site is built with — split out from the site
 * details step so the twenty-tile logo grid gets a full screen rather than
 * sharing one with a name/domain form, where it used to end up buried below
 * the fold.
 */
export function FrameworkStepBody({
  framework,
  onFrameworkChange,
}: {
  framework: FrameworkId;
  onFrameworkChange: (v: FrameworkId) => void;
}) {
  return <FrameworkPicker value={framework} onChange={onFrameworkChange} />;
}

export function FrameworkStepFooter({
  loading,
  onBack,
  onSubmit,
}: {
  loading: boolean;
  onBack: () => void;
  onSubmit: () => void;
}) {
  return <StepFooter onBack={onBack} onSubmit={onSubmit} loading={loading} />;
}
