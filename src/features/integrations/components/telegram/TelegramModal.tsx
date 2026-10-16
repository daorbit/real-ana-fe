import { Badge, Loader, Text } from "@mantine/core";
import { useSendTelegramTestMutation } from "@/app/store";
import { notify, notifyError } from "@/shared/lib/notify";
import type { TelegramStatus } from "@/shared/types";
import { useTelegramLink } from "../../hooks/useTelegramLink";
import { useTelegramOwnBot } from "../../hooks/useTelegramOwnBot";
import { appGuideUrl } from "../../lib/links";
import { ChatMessagePreview } from "../chat/ChatMessagePreview";
import { IntegrationStudio } from "../studio/IntegrationStudio";
import { AsideBlock, SecureNote, SetupChecklist, StudioSection } from "../studio/StudioParts";
import { TelegramBotChooser } from "./TelegramBotChooser";
import { TelegramStatusCard } from "./TelegramStatusCard";
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
      <TelegramStatusCard status={status} testing={testState.isLoading} onTest={runTest} />

      <StudioSection title="Bot" description="Who your messages come from.">
        <TelegramBotChooser status={status} bot={bot} />
      </StudioSection>

      {(usingOwn || status.platformAvailable) && (
        <StudioSection
          title="Chats"
          description="Where messages go. Switch on Form alerts to get every new response there. Reports choose their own chats."
        >
          <div className={classes.delivery}>
            <TelegramLinkedChats workspaceId={workspaceId} link={link} canLink={!usingOwn} />
            {link.linkUrl && <TelegramLinkWaiting linkUrl={link.linkUrl} checking={link.checking} onCheck={link.checkAgain} />}
            {usingOwn && <TelegramOwnBotChats bot={bot} />}
          </div>
        </StudioSection>
      )}

      <StudioSection title="Preview" description="How a new form response looks in a chat with form alerts on.">
        <ChatMessagePreview appId="telegram" appName="Telegram" />
      </StudioSection>
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
