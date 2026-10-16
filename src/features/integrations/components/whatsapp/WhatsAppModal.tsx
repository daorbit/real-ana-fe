import { Badge, Button, Switch, Text } from "@mantine/core";
import { ArrowUpRight, Send } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { WhatsAppStatus } from "@/shared/types";
import { useWhatsAppConnection } from "../../hooks/useWhatsAppConnection";
import { appGuideUrl } from "../../lib/links";
import { ChatMessagePreview } from "../chat/ChatMessagePreview";
import { IntegrationStudio } from "../studio/IntegrationStudio";
import { AsideBlock, SecureNote, SetupChecklist, StudioHero, StudioSection } from "../studio/StudioParts";
import { WhatsAppAddNumber } from "./WhatsAppAddNumber";
import { WhatsAppNumbers } from "./WhatsAppNumbers";
import classes from "./WhatsApp.module.css";

interface Props {
  opened: boolean;
  workspaceId: string;
  canManage: boolean;
  status?: WhatsAppStatus;
  onClose: () => void;
}

function hero(status: WhatsAppStatus | undefined) {
  if (!status?.available) return { state: "off" as const, title: "WhatsApp is not available right now", description: "Delivery through WhatsApp is paused on our side. Email and Telegram still work." };
  if (!status.entitled) return { state: "off" as const, title: "WhatsApp is a Pro feature", description: `Your ${status.planName ?? "current"} plan does not include WhatsApp. Upgrade to send reports and form responses to WhatsApp.` };
  if (status.enabled && status.numbers.length) {
    const n = status.numbers.length;
    return { state: "live" as const, title: "WhatsApp is live", description: `Reports and form alerts can go to ${n} verified number${n === 1 ? "" : "s"}.` };
  }
  if (status.enabled) return { state: "saved" as const, title: "Add your first number", description: "WhatsApp is on. Add and verify a number to start receiving messages." };
  return { state: "off" as const, title: "Connect WhatsApp", description: "Get scheduled reports and every new form response on WhatsApp, at the numbers you verify." };
}

function Aside({ status }: { status?: WhatsAppStatus }) {
  return (
    <>
      <AsideBlock label="About">
        <Text size="sm">
          Reports and new form responses on WhatsApp. Messages come from Quantalog&apos;s WhatsApp number, only to numbers
          that confirmed a code.
        </Text>
      </AsideBlock>
      <AsideBlock label="Setup">
        <SetupChecklist
          items={[
            { label: "Turned on", done: Boolean(status?.enabled) },
            { label: "Number verified", done: Boolean(status?.numbers.length) },
            { label: "Form alerts on", done: Boolean(status?.numbers.some((n) => n.formAlerts)) },
          ]}
        />
      </AsideBlock>
      <AsideBlock label="Privacy">
        <SecureNote>Every number confirms a 6-digit code before it can receive anything. Remove a number at any time.</SecureNote>
      </AsideBlock>
    </>
  );
}

function Body({ workspaceId, canManage }: { workspaceId: string; canManage: boolean }) {
  const navigate = useNavigate();
  const wa = useWhatsAppConnection(workspaceId);
  const status = wa.status;
  const ready = Boolean(status?.available && status.entitled);

  return (
    <>
      <StudioHero {...hero(status)} />

      {status?.available && !status.entitled && (
        <Button leftSection={<ArrowUpRight size={15} />} onClick={() => navigate("/app/billing")}>
          See plans
        </Button>
      )}

      {ready && (
        <StudioSection title="WhatsApp delivery" description="Turn it on for this workspace. Workspace admins can change this.">
          <div className={classes.toggle}>
            <div className={classes.toggleText}>
              <Text size="sm" fw={600}>
                {status?.enabled ? "On" : "Off"}
              </Text>
              <Text size="xs" c="dimmed">
                When it is off, nothing is sent to WhatsApp, and your numbers are kept.
              </Text>
            </div>
            <Switch
              size="md"
              checked={Boolean(status?.enabled)}
              disabled={!canManage || wa.toggling}
              onChange={(e) => void wa.toggle(e.currentTarget.checked)}
              aria-label="WhatsApp delivery"
            />
          </div>
        </StudioSection>
      )}

      {ready && status?.enabled && (
        <StudioSection
          title="Numbers"
          description="Who gets messages. Switch on Form alerts for numbers that should get every new response; reports choose their numbers in the report editor."
        >
          <div className={classes.stack}>
            <WhatsAppNumbers wa={wa} />
            <WhatsAppAddNumber wa={wa} />
          </div>
        </StudioSection>
      )}

      <StudioSection title="Preview" description="How a new form response looks on WhatsApp.">
        <ChatMessagePreview appId="whatsapp" appName="WhatsApp" />
      </StudioSection>

      {ready && status?.enabled && Boolean(status.numbers.length) && (
        <StudioSection title="Test the connection" description="Send a sample message to every verified number.">
          <Button variant="default" leftSection={<Send size={15} />} loading={wa.testing} onClick={() => void wa.test()}>
            Send test message
          </Button>
        </StudioSection>
      )}
    </>
  );
}

export function WhatsAppModal({ opened, workspaceId, canManage, status, onClose }: Props) {
  const live = Boolean(status?.enabled && status.numbers.length);
  return (
    <IntegrationStudio
      opened={opened}
      onClose={onClose}
      brand="whatsapp"
      title="WhatsApp"
      subtitle="Reports and form alerts on WhatsApp"
      badge={
        <Badge size="sm" variant="light" color={live ? "teal" : "gray"}>
          {live ? "Connected" : "Not connected"}
        </Badge>
      }
      docsUrl={appGuideUrl("whatsapp")}
      aside={<Aside status={status} />}
    >
      {opened && <Body workspaceId={workspaceId} canManage={canManage} />}
    </IntegrationStudio>
  );
}
