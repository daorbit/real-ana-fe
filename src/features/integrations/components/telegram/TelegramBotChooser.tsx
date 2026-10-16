import { useEffect, useState } from "react";
import { Button, PasswordInput, Text, UnstyledButton } from "@mantine/core";
import { useTranslation } from "react-i18next";
import type { TelegramStatus } from "@/shared/types";
import type { useTelegramOwnBot } from "../../hooks/useTelegramOwnBot";
import classes from "./Telegram.module.css";

interface Props {
  status: TelegramStatus;
  bot: ReturnType<typeof useTelegramOwnBot>;
}

export function TelegramBotChooser({ status, bot }: Props) {
  const { t } = useTranslation();
  const usingOwn = status.mode === "own";
  const [ownPicked, setOwnPicked] = useState(usingOwn || !status.platformAvailable);
  useEffect(() => {
    setOwnPicked(usingOwn || !status.platformAvailable);
  }, [usingOwn, status.platformAvailable]);
  const showToken = !usingOwn && ownPicked;

  const pickQuantalog = () => {
    if (usingOwn) bot.switchBack();
    else setOwnPicked(false);
  };

  return (
    <>
      <div className={classes.modes}>
        <UnstyledButton
          type="button"
          className={classes.mode}
          data-active={(!usingOwn && !ownPicked) || undefined}
          disabled={!status.platformAvailable || bot.removing}
          onClick={pickQuantalog}
        >
          <Text size="sm" fw={600}>
            Quantalog bot
          </Text>
          <Text size="xs" c="dimmed">
            {status.platformAvailable
              ? `Messages come from @${status.platformBot}. Nothing to set up: connect a chat and you are done.`
              : t("reports.tgPlatformMissing")}
          </Text>
        </UnstyledButton>
        <UnstyledButton
          type="button"
          className={classes.mode}
          data-active={usingOwn || ownPicked || undefined}
          onClick={() => setOwnPicked(true)}
        >
          <Text size="sm" fw={600}>
            {t("reports.tgOwnBotTitle")}
          </Text>
          <Text size="xs" c="dimmed">
            {usingOwn ? t("reports.tgViaOwn", { bot: status.ownBot?.username }) : t("reports.tgOwnBotHint")}
          </Text>
        </UnstyledButton>
      </div>

      {showToken && (
        <div className={`${classes.inline} ${classes.manual}`}>
          <PasswordInput
            className={classes.grow}
            size="sm"
            placeholder="123456789:AAH…"
            aria-label={t("reports.tgOwnBotToken")}
            value={bot.token}
            autoComplete="new-password"
            onChange={(e) => bot.setToken(e.currentTarget.value)}
          />
          <Button size="sm" onClick={bot.save} loading={bot.saving} disabled={!bot.token.trim()}>
            {t("reports.tgOwnBotSave")}
          </Button>
        </div>
      )}
    </>
  );
}
