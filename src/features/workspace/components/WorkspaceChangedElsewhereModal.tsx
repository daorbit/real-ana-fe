import { Button, Group, Modal, Stack, Text } from "@mantine/core";
import { ArrowLeftRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useScreenLocked } from "@/shared/hooks/useScreenLocked";
import { useWorkspaceChangedElsewhere } from "../hooks/useWorkspaceChangedElsewhere";

export function WorkspaceChangedElsewhereModal() {
  const { t } = useTranslation();
  const { current, incoming, accept, dismiss } = useWorkspaceChangedElsewhere();
  const locked = useScreenLocked();

  if (!current || !incoming || locked) return null;

  return (
    <Modal
      opened
      onClose={dismiss}
      title={t("workspaces.otherTabTitle", "Workspace changed in another tab")}
      centered
      radius="lg"
    >
      <Stack gap="md">
        <Text size="sm" c="dimmed">
          {t("workspaces.otherTabBody", {
            other: incoming.name,
            current: current.name,
            defaultValue:
              "You switched to {{other}} in another tab. This tab is still showing {{current}}, so anything you change here goes to {{current}}.",
          })}
        </Text>
        <Group justify="flex-end">
          <Button leftSection={<ArrowLeftRight size={16} />} onClick={accept}>
            {t("workspaces.otherTabSwitch", { name: incoming.name, defaultValue: "Switch to {{name}}" })}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
