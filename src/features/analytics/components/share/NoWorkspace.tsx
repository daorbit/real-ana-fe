import { Button, Center, Stack, Text, ThemeIcon } from "@mantine/core";
import { Link2Off } from "lucide-react";
import { useTranslation } from "react-i18next";

export function NoWorkspace() {
  const { t } = useTranslation();
  return (
    <Center py={64}>
      <Stack align="center" gap={8} maw={380}>
        <ThemeIcon variant="light" color="gray" size={48} radius="md">
          <Link2Off size={22} />
        </ThemeIcon>
        <Text fw={650} mt={4}>{t("share.noWorkspaceTitle")}</Text>
        <Text c="dimmed" size="sm" ta="center">{t("share.noWorkspaceBody")}</Text>
        <Button component="a" href="/app/workspaces" variant="light" mt="sm">
          {t("share.noWorkspaceCta")}
        </Button>
      </Stack>
    </Center>
  );
}
