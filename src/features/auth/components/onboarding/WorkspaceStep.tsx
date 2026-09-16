import { Button, Group, Stack, Text, TextInput } from "@mantine/core";
import { ArrowRight, BarChart3, Share2, Users } from "lucide-react";

const WHY = [
  { icon: BarChart3, text: "Analytics, forms, SEO and scheduling, all in one place" },
  { icon: Users, text: "Invite teammates with access to just this workspace" },
  { icon: Share2, text: "Switch between workspaces any time from the sidebar" },
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

      <Stack gap="sm">
        {WHY.map(({ icon: Icon, text }) => (
          <Group key={text} gap={10} wrap="nowrap">
            <Icon size={16} style={{ flexShrink: 0, opacity: 0.7 }} />
            <Text size="sm" c="dimmed">{text}</Text>
          </Group>
        ))}
      </Stack>
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
