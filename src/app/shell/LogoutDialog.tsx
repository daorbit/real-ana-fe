import { ActionIcon, Button, Group, Modal, Stack, Text } from "@mantine/core";
import { X } from "lucide-react";
import bannerSrc from "@/assets/banners/logout-banner.svg";

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
      centered
      size={440}
      padding={0}
      withCloseButton={false}
    >
      <Stack gap={0} className="verify-card" pos="relative">
        <ActionIcon
          variant="subtle"
          color="gray"
          size="sm"
          onClick={onStay}
          style={{ position: "absolute", top: 14, right: 14, zIndex: 10 }}
        >
          <X size={16} style={{ pointerEvents: "none", color: "#fff" }} />
        </ActionIcon>
        <div
          style={{
            height: 154,
            backgroundImage: `url(${bannerSrc})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <Stack gap="lg" p={26}>
          <Text size="sm" c="dimmed" lh={1.55}>
            You'll be signed out and need to log in again to see your analytics.
            Your workspaces and settings stay exactly as you left them.
          </Text>
          <Group justify="flex-end" gap="sm">
            <Button variant="default" onClick={onStay}>Stay</Button>
            <Button color="#c1443c" onClick={onLogout}>Log out</Button>
          </Group>
        </Stack>
      </Stack>
    </Modal>
  );
}
