import { useEffect, useState } from "react";
import { Button, PasswordInput, Text } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { Logo } from "@/shared/ui/Brand";
import type { TelegramStatus } from "@/shared/types";
import type { useTelegramOwnBot } from "../../hooks/useTelegramOwnBot";
import { BrandMark } from "../logos/BrandMarks";
import { TelegramBotOption } from "./TelegramBotOption";
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
  const quantalogActive = !usingOwn && !ownPicked;
  const showToken = !usingOwn && ownPicked;

  const pickQuantalog = () => {
    if (usingOwn) bot.switchBack();
    else setOwnPicked(false);
  };

  return (
    <div className={classes.chooser}>
      <div className={classes.modes}>
        <TelegramBotOption
          avatar={<Logo size={36} />}
          title="Quantalog bot"
          description={
            status.platformAvailable
              ? `Sends as @${status.platformBot}. Nothing to set up.`
              : t("reports.tgPlatformMissing")
          }
          active={quantalogActive}
          disabled={!status.platformAvailable || bot.removing}
          onClick={pickQuantalog}
        />
        <TelegramBotOption
          avatar={<BrandMark id="telegram" size={36} />}
          title={t("reports.tgOwnBotTitle")}
          description={
            usingOwn
              ? `Sends as @${status.ownBot?.username}. Your bot's name and picture.`
              : "Use a bot you made with @BotFather, with your own name and picture."
          }
          active={!quantalogActive}
          onClick={() => setOwnPicked(true)}
        />
      </div>

      {showToken && (
        <div className={classes.panel}>
          <Text size="sm" fw={600}>
            Connect your bot
          </Text>
          <Text size="xs" c="dimmed" mt={2} mb="sm">
            In Telegram, open @BotFather, send /newbot and paste the token it gives you.
          </Text>
          <div className={classes.inline}>
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
        </div>
      )}
    </div>
  );
}
