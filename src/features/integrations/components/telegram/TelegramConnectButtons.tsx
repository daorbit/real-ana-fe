import { Button } from "@mantine/core";
import { Send, Users } from "lucide-react";
import { useTranslation } from "react-i18next";
import classes from "./Telegram.module.css";

export function TelegramConnectButtons({
  linking,
  onConnect,
}: {
  linking: boolean;
  onConnect: (group: boolean) => void;
}) {
  const { t } = useTranslation();
  return (
    <div className={classes.addRow}>
      <Button size="xs" variant="light" leftSection={<Send size={14} />} loading={linking} onClick={() => onConnect(false)}>
        {t("reports.tgConnectChat")}
      </Button>
      <Button size="xs" variant="default" leftSection={<Users size={14} />} onClick={() => onConnect(true)}>
        {t("reports.tgConnectGroup")}
      </Button>
    </div>
  );
}
