import { Button, Group, Stack, Text, TextInput, Title } from "@mantine/core";
import { ArrowRight, BarChart3, Share2, Users } from "lucide-react";

const WHY = [
  { icon: BarChart3, text: "Every site's traffic and reports live in one place" },
  { icon: Users, text: "Invite teammates with access to just this workspace" },
  { icon: Share2, text: "Switch between workspaces any time from the sidebar" },
];

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
      <div>
        <Title order={2} style={{ letterSpacing: "-0.02em" }}>
          Name your workspace
        </Title>
        <Text c="dimmed" size="sm" mt={8}>
          A workspace groups the sites you track together — usually your
          company, or one client.
        </Text>
      </div>

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
  return (
    <Button
      className="auth-btn"
      size="md"
      fullWidth
      loading={loading}
      onClick={onSubmit}
      rightSection={<ArrowRight size={16} />}
    >
      Continue
    </Button>
  );
}
