import { Anchor, Badge, Button, Group, Stack, Text } from "@mantine/core";
import { ExternalLink, FileSpreadsheet } from "lucide-react";
import { timeAgo } from "@/shared/lib/format";
import { IntegrationStudio } from "./studio/IntegrationStudio";
import { AsideBlock, SecureNote, StudioHero, StudioSection } from "./studio/StudioParts";
import { GOOGLE_DATA_POLICY_URL, GOOGLE_SHEETS_DOCS_URL } from "../lib/links";
import type { LinkedSheet, SheetsStatus } from "../types";
import classes from "./GoogleSheetsModal.module.css";

interface Props {
  opened: boolean;
  status: SheetsStatus | undefined;
  busy: boolean;
  refreshing: boolean;
  onClose: () => void;
  onConnect: () => void;
  onDisconnect: () => void;
  onRefresh: () => void;
}

const HOW_IT_WORKS = [
  "Connect the Google account the spreadsheets should live in.",
  "The first response to a form creates a spreadsheet named after it.",
  "Every response after that is added as a new row, with the time and a response ID.",
  "New fields on the form become new columns automatically.",
];

function SheetsAside() {
  return (
    <>
      <AsideBlock label="How it works">
        <ol className={classes.steps}>
          {HOW_IT_WORKS.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </AsideBlock>
      <AsideBlock label="Security">
        <SecureNote>
          Quantalog can only open spreadsheets it created for you, never your other Google Drive files. Tokens are
          encrypted, and you can disconnect at any time.
        </SecureNote>
      </AsideBlock>
      <AsideBlock label="Privacy">
        <Anchor href={GOOGLE_DATA_POLICY_URL} target="_blank" rel="noopener noreferrer" size="sm">
          How we handle Google data
        </Anchor>
      </AsideBlock>
    </>
  );
}

function SheetRow({ sheet }: { sheet: LinkedSheet }) {
  return (
    <div className={classes.sheet}>
      <FileSpreadsheet size={18} className={classes.sheetIcon} />
      <div className={classes.sheetText}>
        <Text size="sm" fw={550} truncate>
          {sheet.formTitle}
        </Text>
        <Text size="xs" c="dimmed">
          {sheet.rows === 1 ? "1 row" : `${sheet.rows} rows`}
          {sheet.lastRowAt ? ` · last added ${timeAgo(sheet.lastRowAt)}` : ""}
        </Text>
      </div>
      <Button
        component="a"
        href={sheet.spreadsheetUrl}
        target="_blank"
        rel="noopener noreferrer"
        size="compact-sm"
        variant="default"
        className={classes.open}
        rightSection={<ExternalLink size={13} />}
      >
        Open
      </Button>
    </div>
  );
}

function LinkedSheets({ sheets }: { sheets: LinkedSheet[] }) {
  return (
    <div className={classes.sheets}>
      {sheets.length === 0 ? (
        <Text size="sm" c="dimmed" className={classes.empty}>
          No spreadsheets yet. The next response to any form creates its sheet.
        </Text>
      ) : (
        sheets.map((sheet) => <SheetRow key={sheet.formId} sheet={sheet} />)
      )}
    </div>
  );
}

export function GoogleSheetsModal({ opened, status, busy, refreshing, onClose, onConnect, onDisconnect, onRefresh }: Props) {
  const connected = Boolean(status?.connected);
  const expired = !connected && status?.status === "revoked";

  const footer = (
    <Group justify="space-between" wrap="nowrap">
      {connected || expired ? (
        <Button type="button" variant="subtle" color="red" onClick={onDisconnect} loading={busy}>
          {connected ? "Disconnect" : "Remove"}
        </Button>
      ) : (
        <Button type="button" variant="default" onClick={onClose}>
          Cancel
        </Button>
      )}
      <Group gap="xs" wrap="nowrap">
        {connected ? (
          <>
            <Button type="button" variant="default" onClick={onConnect} disabled={busy}>
              Switch account
            </Button>
            <Button type="button" onClick={onClose}>
              Done
            </Button>
          </>
        ) : (
          <Button type="button" onClick={onConnect} loading={busy}>
            {expired ? "Reconnect Google" : "Continue to Google"}
          </Button>
        )}
      </Group>
    </Group>
  );

  return (
    <IntegrationStudio
      opened={opened}
      onClose={onClose}
      brand="google-sheets"
      title="Google Sheets"
      subtitle={connected || expired ? status?.email || "Google account" : "A spreadsheet row for every response"}
      badge={
        connected ? (
          <Badge color="teal" variant="light" size="sm">
            Connected
          </Badge>
        ) : expired ? (
          <Badge color="orange" variant="light" size="sm">
            Access expired
          </Badge>
        ) : (
          <Badge color="gray" variant="light" size="sm">
            Not connected
          </Badge>
        )
      }
      docsUrl={GOOGLE_SHEETS_DOCS_URL}
      aside={<SheetsAside />}
      footer={footer}
      onRefresh={onRefresh}
      refreshing={refreshing}
      refreshDisabled={busy}
    >
      <StudioHero
        state={connected ? "live" : expired ? "saved" : "off"}
        pill={expired ? "Access expired" : undefined}
        title={connected ? "Responses go to Google Sheets" : expired ? "Reconnect Google Sheets" : "Connect Google Sheets"}
        description={
          connected
            ? `Every form adds a row to its own spreadsheet in ${status?.email || "your Google account"} the moment a response comes in.`
            : expired
              ? "Google no longer accepts this connection, so new responses are not being added. Reconnect to resume."
              : "Get a spreadsheet for every form, with a new row for each response. Share it, chart it, or connect it to anything."
        }
        stats={
          connected && status
            ? [
                { label: "Spreadsheets", value: status.sheets.length },
                { label: "Rows added", value: status.sheets.reduce((sum, sheet) => sum + sheet.rows, 0), tone: "ok" },
                {
                  label: "Last row",
                  value: status.lastUsedAt ? timeAgo(status.lastUsedAt) : "Not yet",
                  tone: status.lastError ? "warn" : undefined,
                },
              ]
            : undefined
        }
      />

      {connected && status?.lastError && (
        <Text size="sm" className={classes.errorText}>
          The last response could not be added: {status.lastError}
        </Text>
      )}

      {connected && status ? (
        <StudioSection title="Your spreadsheets" description="One sheet per form, newest activity first.">
          <LinkedSheets sheets={status.sheets} />
        </StudioSection>
      ) : (
        <StudioSection
          title="Google will ask you to allow"
          description="A Google window opens to finish the connection."
        >
          <Stack gap={4}>
            <Text size="sm" fw={550}>
              See, edit, create and delete only the Google Drive files you use with this app
            </Text>
            <Text size="xs" c="dimmed">
              That is how Quantalog creates your response sheets and adds rows to them. It cannot see any other file in
              your Drive.
            </Text>
          </Stack>
        </StudioSection>
      )}
    </IntegrationStudio>
  );
}
