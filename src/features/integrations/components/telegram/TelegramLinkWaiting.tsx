import { Anchor, Button, Group, Text } from "@mantine/core";
import { RefreshCw } from "lucide-react";
import { useTranslation } from "react-i18next";
import classes from "./Telegram.module.css";

export function TelegramLinkWaiting({
  linkUrl,
  checking,
  onCheck,
}: {
  linkUrl: string;
  checking: boolean;
  onCheck: () => void;
}) {
  const { t } = useTranslation();
  return (
    <div className={classes.waiting}>
      <Text size="xs">{t("reports.tgWaiting")}</Text>
      <Group gap="xs" mt={8}>
        <Button size="compact-xs" variant="default" leftSection={<RefreshCw size={12} />} loading={checking} onClick={onCheck}>
          {t("reports.tgCheckAgain")}
        </Button>
        <Anchor href={linkUrl} target="_blank" rel="noreferrer" size="xs">
          {t("reports.tgOpenAgain")}
        </Anchor>
      </Group>
    </div>
  );
}
