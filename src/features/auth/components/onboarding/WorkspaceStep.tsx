import { Button, Group, Stack, TextInput } from "@mantine/core";
import { ArrowLeft, ArrowRight, BarChart3, Share2, Users } from "lucide-react";
import s from "./WorkspaceStep.module.css";


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
  onBack,
  onSubmit,
}: {
  loading: boolean;
  /** Absent on the workspace-only path, where this is the first screen. */
  onBack?: () => void;
  onSubmit: () => void;
}) {
  // Sized to its label, not stretched across the column: a button as wide as
  // the form reads as a banner, and there is nothing to balance it against.
  return (
    <Group justify={onBack ? "space-between" : "flex-end"} wrap="nowrap">
      {onBack && (
        <Button
          className="auth-btn"
          size="sm"
          variant="subtle"
          color="gray"
          leftSection={<ArrowLeft size={14} />}
          onClick={onBack}
        >
          Back
        </Button>
      )}
      <Button
        className="auth-btn"
        size="sm"
        loading={loading}
        onClick={onSubmit}
        rightSection={<ArrowRight size={15} />}
      >
        Continue
      </Button>
    </Group>
  );
}
