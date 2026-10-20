import { ActionIcon, Badge, Button, CopyButton, Group, Text, TextInput, Tooltip } from "@mantine/core";
import { Check, Copy, ExternalLink } from "lucide-react";
import type { ConnectedApp } from "@/features/connectors/lib/connectorApi";
import { timeAgo } from "@/shared/lib/format";
import { IntegrationStudio } from "../studio/IntegrationStudio";
import { AsideBlock, SecureNote, StudioHero, StudioSection } from "../studio/StudioParts";
import { ASSISTANT_CAN_READ, ASSISTANT_PROMPTS, type AssistantInfo } from "../../lib/aiAssistants";
import { appGuideUrl } from "../../lib/links";
import classes from "./Assistant.module.css";

interface Props {
  opened: boolean;
  info: AssistantInfo;
  workspaceName: string;
  mcpUrl: string;
  connections: ConnectedApp[];
  elsewhere: ConnectedApp[];
  revokingId: string | null;
  onClose: () => void;
  onRefresh: () => void;
  onDisconnect: (app: ConnectedApp) => void;
}

function Aside({ name }: { name: string }) {
  return (
    <>
      <AsideBlock label={`What ${name} can read`}>
        <ul className={classes.list}>
          {ASSISTANT_CAN_READ.map((item) => (
            <li key={item}>
              <Check size={14} className={classes.check} />
              {item}
            </li>
          ))}
        </ul>
      </AsideBlock>
      <AsideBlock label="Security">
        <SecureNote>
          Read-only: {name} can't create, change or delete anything. Each connection belongs to one person and one
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
          {app.workspaceName || "Workspace"} · connected {timeAgo(app.connectedAt)}
          {app.lastUsedAt ? ` · used ${timeAgo(app.lastUsedAt)}` : " · not used yet"}
        </Text>
      </div>
      <Button variant="subtle" color="red" size="xs" loading={busy} onClick={onDisconnect}>
        Disconnect
      </Button>
    </div>
  );
}

export function AssistantModal({
  opened,
  info,
  workspaceName,
  mcpUrl,
  connections,
  elsewhere,
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
        href={info.connectorsUrl}
        target="_blank"
        rel="noreferrer"
        rightSection={<ExternalLink size={15} />}
      >
        {info.connectorsLabel}
      </Button>
    </Group>
  );

  return (
    <IntegrationStudio
      opened={opened}
      onClose={onClose}
      brand={info.id}
      title={info.name}
      docsUrl={appGuideUrl(info.id)}
      subtitle={`Read-only access to ${workspaceName || "this workspace"}`}
      badge={
        <Badge color={connected ? "teal" : "gray"} variant="light" size="sm">
          {connected ? "Connected" : "Not connected"}
        </Badge>
      }
      aside={<Aside name={info.name} />}
      footer={footer}
      onRefresh={onRefresh}
    >
      <StudioHero
        state={connected ? "live" : "off"}
        title={connected ? `${info.name} can read this workspace` : `Connect ${info.name} to Quantalog`}
        description={
          connected
            ? `Ask ${info.name} about your forms, leads, bookings and traffic in plain language. Disconnect any connection below.`
            : `Add Quantalog as a connector in ${info.name}, then ask questions about your forms, leads, bookings and traffic.`
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

      <StudioSection title="Connector URL" description={`Paste this into ${info.name} when you add the connector.`}>
        <UrlField url={mcpUrl} />
      </StudioSection>

      <StudioSection title={`Add it in ${info.name}`} description={info.note}>
        <ol className={classes.steps}>
          {info.steps.map((step, index) => (
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

      {elsewhere.length > 0 && (
        <StudioSection
          title="Connected to other workspaces"
          description={`These ${info.name} connections read a different workspace, not ${workspaceName || "this one"}. To use this workspace, add the connector URL above.`}
        >
          <div className={classes.rows}>
            {elsewhere.map((app) => (
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
          {ASSISTANT_PROMPTS.map((prompt) => (
            <li key={prompt}>
              <Text size="sm">{prompt}</Text>
            </li>
          ))}
        </ul>
      </StudioSection>
    </IntegrationStudio>
  );
}
