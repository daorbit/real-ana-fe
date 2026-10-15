import { Anchor, Badge, Button, Group, Text } from "@mantine/core";
import { CalendarDays, Check, KeyRound } from "lucide-react";
import { IntegrationStudio } from "./studio/IntegrationStudio";
import { AsideBlock, SecureNote, StudioHero, StudioSection } from "./studio/StudioParts";
import { GOOGLE_DATA_POLICY_URL, GOOGLE_CALENDAR_DOCS_URL } from "../lib/links";
import type { CalendarStatus } from "../types";
import classes from "./GoogleCalendarModal.module.css";

interface Props {
  opened: boolean;
  status: CalendarStatus | undefined;
  busy: boolean;
  onClose: () => void;
  onConnect: () => void;
  onDisconnect: () => void;
}

const USES = [
  "Hides times you are already busy on booking fields",
  "Adds every booking to the calendar you pick",
  "Creates a Google Meet link and emails the invite",
];

const PERMISSIONS = [
  { name: "See your email address", why: "Shows which Google account is connected." },
  { name: "See the list of your calendars", why: "Lets you pick where bookings go and which calendars to check." },
  { name: "See availability on your calendars", why: "Free and busy times only, never event titles or details." },
  {
    name: "View and edit events on your calendars",
    why: "Adds each booking with its Meet link, and cancels it when you delete the entry. Quantalog only changes events it created.",
  },
];

function CalendarAside() {
  return (
    <>
      <AsideBlock label="Used for">
        <ul className={classes.list}>
          {USES.map((use) => (
            <li key={use}>
              <Check size={14} className={classes.check} />
              {use}
            </li>
          ))}
        </ul>
      </AsideBlock>
      <AsideBlock label="Security">
        <SecureNote>
          Google tokens are encrypted and stay on Quantalog's servers. Disconnect here at any time, or remove access from
          your Google Account's security settings.
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

function CalendarList({ status }: { status: CalendarStatus }) {
  return (
    <div className={classes.calendars}>
      {status.calendars.length === 0 && <div className={classes.empty}>No calendars found.</div>}
      {status.calendars.map((calendar) => (
        <div key={calendar.id} className={classes.calendar}>
          <CalendarDays size={15} className={classes.calendarIcon} />
          <span className={classes.calendarName}>{calendar.summary}</span>
          {calendar.primary ? (
            <Badge variant="light" color="blue" size="xs">
              Primary
            </Badge>
          ) : (
            !calendar.canWrite && (
              <Text size="xs" c="dimmed">
                Read only
              </Text>
            )
          )}
        </div>
      ))}
    </div>
  );
}

function PermissionList() {
  return (
    <ul className={classes.list}>
      {PERMISSIONS.map((permission) => (
        <li key={permission.name}>
          <KeyRound size={14} className={classes.key} />
          <div>
            <Text size="sm" fw={550}>
              {permission.name}
            </Text>
            <div className={classes.permissionWhy}>{permission.why}</div>
          </div>
        </li>
      ))}
    </ul>
  );
}

export function GoogleCalendarModal({ opened, status, busy, onClose, onConnect, onDisconnect }: Props) {
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
      brand="google-calendar"
      title="Google Calendar"
      docsUrl={GOOGLE_CALENDAR_DOCS_URL}
      subtitle={connected || expired ? status?.email || "Google account" : "Scheduling for booking fields"}
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
      aside={<CalendarAside />}
      footer={footer}
    >
      <StudioHero
        state={connected ? "live" : expired ? "saved" : "off"}
        pill={expired ? "Access expired" : undefined}
        title={
          connected ? "Google Calendar is connected" : expired ? "Reconnect Google Calendar" : "Connect Google Calendar"
        }
        description={
          connected
            ? `Booking fields check busy times and add events to ${status?.email || "this Google account"}.`
            : expired
              ? "Google no longer accepts this connection. Bookings still work, but busy times are not checked and no events are added until you reconnect."
              : "Let booking fields skip times you are busy, add every booking to your calendar and send a Google Meet link."
        }
        stats={
          connected && status
            ? [
                { label: "Calendars", value: status.calendars.length },
                {
                  label: "Can take bookings",
                  value: status.calendars.filter((c) => c.canWrite).length,
                  tone: "ok",
                },
                {
                  label: "Primary calendar",
                  value: status.calendars.find((c) => c.primary)?.summary ?? "None",
                },
              ]
            : undefined
        }
      />

      {connected && status ? (
        <StudioSection title="Calendars on this account" description="Pick where bookings go from each booking field.">
          <CalendarList status={status} />
        </StudioSection>
      ) : (
        <StudioSection title="Google will ask you to allow" description="A Google window opens to finish the connection.">
          <PermissionList />
        </StudioSection>
      )}
    </IntegrationStudio>
  );
}
