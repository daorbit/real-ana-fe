import { Box, Button, Group, Text } from "@mantine/core";
import { Save, Undo2 } from "lucide-react";
import { useTranslation } from "react-i18next";

export function SaveBar({
  saving,
  onDiscard,
}: {
  saving: boolean;
  onDiscard: () => void;
}) {
  const { t } = useTranslation();

  return (
    <Box className="save-bar">
      <Group justify="space-between" gap="md" wrap="nowrap">
        <Group gap={8} wrap="nowrap" style={{ minWidth: 0 }}>
          <span className="save-bar__dot" aria-hidden />
          <Text size="sm" fw={500} truncate>
            {t("common.unsavedChanges")}
          </Text>
        </Group>
        <Group gap="sm" wrap="nowrap">
          <Button
            variant="default"
            size="sm"
            leftSection={<Undo2 size={15} />}
            onClick={onDiscard}
            disabled={saving}
            title={`${t("common.discard")} (Esc)`}
          >
            {t("common.discard")}
            <Text component="span" size="xs" c="dimmed" ml={6} visibleFrom="sm">
              Esc
            </Text>
          </Button>
          <Button
            type="submit"
            size="sm"
            leftSection={<Save size={15} />}
            loading={saving}
          >
            {t("common.save")}
          </Button>
        </Group>
      </Group>
    </Box>
  );
}
