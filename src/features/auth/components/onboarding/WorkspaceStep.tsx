import { Button, Group, Stack, TextInput } from "@mantine/core";
import { ArrowRight, BarChart3, Share2, Users } from "lucide-react";
import s from "./WorkspaceStep.module.css";

/**
 * What a workspace gets you. Each line is a term and its gloss rather than one
 * long sentence: three full sentences of equal weight under a form is a wall
 * that gets skipped, where a bolded lead-in gives the eye somewhere to land
 * and the rest can be read or not.
 */
const WHY = [
  {
    icon: BarChart3,
    term: "Everything in one place",
    gloss: "Analytics, forms, SEO and scheduling",
  },
  {
    icon: Users,
    term: "Scoped access",
    gloss: "Invite teammates to just this workspace",
  },
  {
    icon: Share2,
    term: "Switch any time",
    gloss: "Move between workspaces from the sidebar",
  },
];

/** Title and lede live on the shell — this is the step's controls only. */
export function WorkspaceStepBody({
  wsName,
  wsError,
  onChange,
  onSubmit,
}: {
  wsName: string;
  wsError: string | null;
  onChange: (v: string) => void;
  onSubmit: () => void;
}) {
  return (
    <Stack gap="xl">
      <TextInput
        size="md"
        label="Workspace name"
        placeholder="Acme Inc"
        value={wsName}
        error={wsError}
        onChange={(e) => onChange(e.currentTarget.value)}
        onKeyDown={(e) => e.key === "Enter" && onSubmit()}
        data-autofocus
      />

      {/* Separated from the field by a hairline, not just by space: this is
          reference material about what you are naming, not a third thing to
          fill in, and the rule says so without a heading. */}
      <ul className={s.why}>
        {WHY.map(({ icon: Icon, term, gloss }) => (
          <li key={term} className={s.whyRow}>
            <Icon size={15} className={s.whyIcon} aria-hidden />
            <div>
              <span className={s.whyTerm}>{term}</span>
              <span className={s.whyGloss}>{gloss}</span>
            </div>
          </li>
        ))}
      </ul>
    </Stack>
  );
}

export function WorkspaceStepFooter({
  loading,
  onSubmit,
}: {
  loading: boolean;
  onSubmit: () => void;
}) {
  // Sized to its label, not stretched across the column: a button as wide as
  // the form reads as a banner, and there is nothing to balance it against.
  return (
    <Group justify="flex-end">
      <Button
        className="auth-btn"
        size="md"
        loading={loading}
        onClick={onSubmit}
        rightSection={<ArrowRight size={16} />}
      >
        Continue
      </Button>
    </Group>
  );
}
