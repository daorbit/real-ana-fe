import { Badge, Button, Loader, Text } from "@mantine/core";
import { Send } from "lucide-react";
import { useSendTelegramTestMutation } from "@/app/store";
import { notify, notifyError } from "@/shared/lib/notify";
import type { TelegramStatus } from "@/shared/types";
import { useTelegramLink } from "../../hooks/useTelegramLink";
import { useTelegramOwnBot } from "../../hooks/useTelegramOwnBot";
import { appGuideUrl } from "../../lib/links";
import { ChatMessagePreview } from "../chat/ChatMessagePreview";
import { IntegrationStudio } from "../studio/IntegrationStudio";
import { AsideBlock, SecureNote, SetupChecklist, StudioHero, StudioSection, type StudioStat } from "../studio/StudioParts";
import { TelegramBotChooser } from "./TelegramBotChooser";
import { TelegramLinkWaiting } from "./TelegramLinkWaiting";
import { TelegramLinkedChats } from "./TelegramLinkedChats";
import { TelegramOwnBotChats } from "./TelegramOwnBotChats";
import classes from "./Telegram.module.css";

interface Props {
  opened: boolean;
  workspaceId: string;
  status?: TelegramStatus;
  onClose: () => void;
}

function senderOf(status: TelegramStatus): string {
  if (status.mode === "own") return `@${status.ownBot?.username ?? ""}`;
  return status.platformBot ? `@${status.platformBot}` : "Quantalog bot";
}

function statsFor(status: TelegramStatus): StudioStat[] {
  const alerts = status.chats.filter((c) => c.formAlerts).length;
  return [
    { label: "Sends as", value: senderOf(status) },
    { label: "Linked chats", value: status.chats.length, tone: status.chats.length ? "ok" : "warn" },
    { label: "Get form alerts", value: alerts, tone: alerts ? "ok" : undefined },
  ];
}

function TelegramBody({ workspaceId }: { workspaceId: string }) {
  const link = useTelegramLink(workspaceId);
  const bot = useTelegramOwnBot(workspaceId);
  const [sendTest, testState] = useSendTelegramTestMutation();
  const status = link.status;

  if (!status) {
    return (
      <div className={classes.loading}>
        <Loader size="sm" />
      </div>
    );
  }

  const usingOwn = status.mode === "own";
  const live = status.chats.length > 0;

  const runTest = async () => {
    try {
      const result = await sendTest({ workspaceId }).unwrap();
      if (result.sent.length) notify.success(`Test sent to ${result.sent.join(", ")}.`);
      for (const f of result.failed) notify.error(`${f.chat}: ${f.error}`);
    } catch (e) {
      notifyError(e, "Could not send the test message.");
    }
  };

  return (
    <>
      <StudioHero
        state={live ? "live" : "off"}
        title={live ? "Telegram is live" : "Connect Telegram"}
        description="One Telegram connection for this workspace. Reports pick which chats they go to, and chats with form alerts on get a message for every new form response."
        stats={statsFor(status)}
      />

      <StudioSection title="Bot" description="Who the messages come from.">
        <TelegramBotChooser status={status} bot={bot} />
      </StudioSection>

      {(usingOwn || status.platformAvailable) && (
        <StudioSection
          title="Chats"
          description="Chats this workspace can send to. Turn on form alerts where new responses should be posted; pick chats for each report in the report's Delivery settings."
        >
          <div className={classes.delivery}>
            <TelegramLinkedChats workspaceId={workspaceId} link={link} canLink={!usingOwn} />
            {link.linkUrl && <TelegramLinkWaiting linkUrl={link.linkUrl} checking={link.checking} onCheck={link.checkAgain} />}
            {usingOwn && <TelegramOwnBotChats bot={bot} />}
          </div>
        </StudioSection>
      )}

      <StudioSection title="Form alert preview" description="What a chat with form alerts on shows for each new response.">
        <ChatMessagePreview appId="telegram" appName="Telegram" />
      </StudioSection>

      {live && (
        <StudioSection title="Test the connection" description="Post a sample message to every linked chat.">
          <Button type="button" variant="default" leftSection={<Send size={15} />} loading={testState.isLoading} onClick={runTest}>
            Send test message
          </Button>
        </StudioSection>
      )}
    </>
  );
}

function TelegramAside({ status }: { status?: TelegramStatus }) {
  return (
    <>
      <AsideBlock label="About">
        <Text size="sm">Scheduled reports and new form responses, delivered to Telegram chats, groups and channels.</Text>
      </AsideBlock>
      <AsideBlock label="Setup">
        <SetupChecklist
          items={[
            { label: "Bot chosen", done: Boolean(status && (status.mode === "own" || status.platformAvailable)) },
            { label: "Chat linked", done: Boolean(status?.chats.length) },
            { label: "Form alerts on", done: Boolean(status?.chats.some((c) => c.formAlerts)) },
          ]}
        />
      </AsideBlock>
      <AsideBlock label="Security">
        <SecureNote>Your bot token is encrypted on the server and never shown again. Send /stop in a chat to unlink it.</SecureNote>
      </AsideBlock>
    </>
  );
}

export function TelegramModal({ opened, workspaceId, status, onClose }: Props) {
  return (
    <IntegrationStudio
      opened={opened}
      onClose={onClose}
      brand="telegram"
      title="Telegram"
      subtitle="Reports and form alerts in Telegram"
      badge={
        status?.chats.length ? (
          <Badge size="sm" variant="light" color="teal">
            Connected
          </Badge>
        ) : (
          <Badge size="sm" variant="light" color="gray">
            Not connected
          </Badge>
        )
      }
      docsUrl={appGuideUrl("telegram")}
      aside={<TelegramAside status={status} />}
    >
      {opened && <TelegramBody workspaceId={workspaceId} />}
    </IntegrationStudio>
  );
}
