import { Button, Group, Modal, Stack, Text } from "@mantine/core";

export function LogoutDialog({
  opened,
  onStay,
  onLogout,
}: {
  opened: boolean;
  onStay: () => void;
  onLogout: () => void;
}) {
  return (
    <Modal
      opened={opened}
      onClose={onStay}
      title="Log out?"
      radius="lg"
      size={400}
      centered
    >
      <Stack gap="lg" pt={4}>
        <Text size="sm" c="dimmed" lh={1.55}>
          You'll be signed out and need to log in again to see your analytics.
          Your workspaces and settings stay exactly as you left them.
        </Text>
        <Group justify="flex-end" gap="sm">
          <Button variant="default" onClick={onStay}>Stay</Button>
          <Button color="#c1443c" onClick={onLogout}>Log out</Button>
        </Group>
      </Stack>
    </Modal>
  );
}
