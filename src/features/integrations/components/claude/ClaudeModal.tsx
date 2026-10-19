import { ActionIcon, Badge, Button, CopyButton, Group, Text, TextInput, Tooltip } from "@mantine/core";
import { Check, Copy, ExternalLink } from "lucide-react";
import type { ConnectedApp } from "@/features/connectors/lib/connectorApi";
import { timeAgo } from "@/shared/lib/format";
import { IntegrationStudio } from "../studio/IntegrationStudio";
import { AsideBlock, SecureNote, StudioHero, StudioSection } from "../studio/StudioParts";
import { CLAUDE_CONNECTORS_URL } from "../../lib/links";
import classes from "./Claude.module.css";

const CAN_READ = [
  "Workspace name, your role and tracked sites",
  "Forms, their questions and form analytics",
  "Form responses and the lead pipeline",
  "Booking counts and upcoming booked slots",
  "Website traffic summaries",
];

const STEPS = [
  "In Claude, open Settings → Connectors.",
  "Choose Add custom connector, name it Quantalog and paste the URL above.",
  "Click Connect, sign in to Quantalog and pick this workspace.",
  "Ask Claude about your forms, leads, bookings or traffic.",
];

const PROMPTS = [
  "Which of my forms got the most responses this month?",
  "Show my 10 newest leads from the contact form.",
  "How many bookings are coming up this week?",
  "Summarise my website traffic for the last 7 days.",
];

interface Props {
  opened: boolean;
  workspaceName: string;
  mcpUrl: string;
  connections: ConnectedApp[];
  revokingId: string | null;
  onClose: () => void;
  onRefresh: () => void;
  onDisconnect: (app: ConnectedApp) => void;
}

function Aside() {
  return (
    <>
      <AsideBlock label="What Claude can read">
        <ul className={classes.list}>
          {CAN_READ.map((item) => (
            <li key={item}>
              <Check size={14} className={classes.check} />
              {item}
            </li>
          ))}
        </ul>
      </AsideBlock>
      <AsideBlock label="Security">
        <SecureNote>
          Read-only: Claude can't create, change or delete anything. Each connection belongs to one person and one
          workspace, uses short-lived tokens, and stops the moment you disconnect it or leave the workspace.
        </SecureNote>
      </AsideBlock>
    </>
  );
}

function UrlField({ url }: { url: string }) {
  return (
    <TextInput
      readOnly
      value={url}
      aria-label="Connector URL"
      classNames={{ input: classes.url }}
      rightSection={
        <CopyButton value={url}>
          {({ copied, copy }) => (
            <Tooltip label={copied ? "Copied" : "Copy"} withArrow>
              <ActionIcon variant="subtle" color={copied ? "teal" : "gray"} onClick={copy} aria-label="Copy URL">
                {copied ? <Check size={16} /> : <Copy size={16} />}
              </ActionIcon>
            </Tooltip>
          )}
        </CopyButton>
      }
    />
  );
}

function ConnectionRow({ app, busy, onDisconnect }: { app: ConnectedApp; busy: boolean; onDisconnect: () => void }) {
  return (
    <div className={classes.row}>
      <div className={classes.rowText}>
        <Text size="sm" fw={600} truncate>
          {app.clientName}
        </Text>
        <Text size="xs" c="dimmed">
          Connected {timeAgo(app.connectedAt)}
          {app.lastUsedAt ? ` · used ${timeAgo(app.lastUsedAt)}` : " · not used yet"}
        </Text>
      </div>
      <Button variant="subtle" color="red" size="xs" loading={busy} onClick={onDisconnect}>
        Disconnect
      </Button>
    </div>
  );
}

export function ClaudeModal({
  opened,
  workspaceName,
  mcpUrl,
  connections,
  revokingId,
  onClose,
  onRefresh,
  onDisconnect,
}: Props) {
  const connected = connections.length > 0;
  const lastUsed = connections.map((c) => c.lastUsedAt).filter(Boolean).sort().at(-1);

  const footer = (
    <Group justify="space-between" wrap="nowrap">
      <Button type="button" variant="default" onClick={onClose}>
        Close
      </Button>
      <Button
        component="a"
        href={CLAUDE_CONNECTORS_URL}
        target="_blank"
        rel="noreferrer"
        rightSection={<ExternalLink size={15} />}
      >
        Open Claude connectors
      </Button>
    </Group>
  );

  return (
    <IntegrationStudio
      opened={opened}
      onClose={onClose}
      brand="claude"
      title="Claude"
      subtitle={`Read-only access to ${workspaceName || "this workspace"}`}
      badge={
        <Badge color={connected ? "teal" : "gray"} variant="light" size="sm">
          {connected ? "Connected" : "Not connected"}
        </Badge>
      }
      aside={<Aside />}
      footer={footer}
      onRefresh={onRefresh}
    >
      <StudioHero
        state={connected ? "live" : "off"}
        title={connected ? "Claude can read this workspace" : "Connect Claude to Quantalog"}
        description={
          connected
            ? "Ask Claude about your forms, leads, bookings and traffic in plain language. Disconnect any connection below."
            : "Add Quantalog as a custom connector in Claude, then ask questions about your forms, leads, bookings and traffic."
        }
        stats={
          connected
            ? [
                { label: "Connections", value: connections.length, tone: "ok" },
                { label: "Last used", value: lastUsed ? timeAgo(lastUsed) : "Not yet" },
              ]
            : undefined
        }
      />

      <StudioSection title="Connector URL" description="Paste this into Claude when you add the connector.">
        <UrlField url={mcpUrl} />
      </StudioSection>

      <StudioSection title="Add it in Claude">
        <ol className={classes.steps}>
          {STEPS.map((step, index) => (
            <li key={step}>
              <span className={classes.stepNo}>{index + 1}</span>
              <Text size="sm">{step}</Text>
            </li>
          ))}
        </ol>
      </StudioSection>

      {connected && (
        <StudioSection title="Your connections" description="Only connections you made to this workspace are shown.">
          <div className={classes.rows}>
            {connections.map((app) => (
              <ConnectionRow
                key={app.id}
                app={app}
                busy={revokingId === app.id}
                onDisconnect={() => onDisconnect(app)}
              />
            ))}
          </div>
        </StudioSection>
      )}

      <StudioSection title="Try asking">
        <ul className={classes.prompts}>
          {PROMPTS.map((prompt) => (
            <li key={prompt}>
              <Text size="sm">{prompt}</Text>
            </li>
          ))}
        </ul>
      </StudioSection>
    </IntegrationStudio>
  );
}
