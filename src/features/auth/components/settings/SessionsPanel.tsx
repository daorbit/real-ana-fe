import { Badge, Button, Group, Loader, Stack, Text } from "@mantine/core";
import { Laptop, LogOut, Monitor, MonitorSmartphone, Smartphone, Tablet, type LucideIcon } from "lucide-react";
import { SettingsCard } from "./SettingsCard";
import { useSessions, type Session } from "./useSessions";
import { timeAgo } from "@/shared/lib/format";
import { confirmDelete } from "@/shared/lib/notify";
import classes from "./Security.module.css";

const DEVICE_ICONS: Record<string, LucideIcon> = {
  mobile: Smartphone,
  tablet: Tablet,
  desktop: Monitor,
};

function deviceIcon(device: string): LucideIcon {
  return DEVICE_ICONS[device] ?? Laptop;
}

function deviceLabel(session: Session): string {
  return [session.browser, session.os].filter(Boolean).join(" · ") || "Unknown device";
}

function SessionRow({
  session,
  busy,
  onRevoke,
}: {
  session: Session;
  busy: boolean;
  onRevoke: () => void;
}) {
  const Icon = deviceIcon(session.device);

  return (
    <Group justify="space-between" wrap="nowrap" className={classes.sessionRow} data-current={session.current || undefined}>
      <Group gap={12} wrap="nowrap" style={{ minWidth: 0 }}>
        <span className={classes.sessionIcon} data-current={session.current || undefined}>
          <Icon size={17} />
        </span>
        <Stack gap={2} style={{ minWidth: 0 }}>
          <Group gap={8} wrap="nowrap">
            <Text size="sm" fw={600} truncate>
              {deviceLabel(session)}
            </Text>
            {session.current && (
              <Badge size="xs" variant="light" color="green" radius="sm">
                This device
              </Badge>
            )}
          </Group>
          <Text size="xs" c="dimmed" truncate>
            {[session.location, session.current ? "Active now" : `Active ${timeAgo(session.lastSeenAt)}`]
              .filter(Boolean)
              .join(" · ")}
          </Text>
        </Stack>
      </Group>

      {!session.current && (
        <Button variant="default" size="xs" loading={busy} onClick={onRevoke}>
          Revoke
        </Button>
      )}
    </Group>
  );
}

export function SessionsPanel() {
  const { sessions, loading, revokingId, revokingOthers, revoke, revokeOthers } = useSessions();
  const hasOthers = sessions.some((s) => !s.current);

  const confirmRevokeOthers = () => {
    confirmDelete({
      title: "Sign out of all other sessions?",
      body: "Every other device currently signed in to your account will be signed out immediately. You'll stay signed in here.",
      confirmLabel: "Sign out others",
      confirmColor: "red",
      onConfirm: revokeOthers,
    });
  };

  return (
    <SettingsCard
      icon={MonitorSmartphone}
      title="Active sessions"
      badge={
        !loading && (
          <Badge size="sm" variant="light" color="gray" radius="sm">
            {sessions.length}
          </Badge>
        )
      }
      description="Devices and browsers currently signed in to your account."
      action={
        hasOthers && (
          <Button
            variant="default"
            color="red"
            size="sm"
            leftSection={<LogOut size={15} />}
            loading={revokingOthers}
            onClick={confirmRevokeOthers}
          >
            Sign out others
          </Button>
        )
      }
    >
      {loading ? (
        <Group justify="center" py="lg">
          <Loader size="sm" />
        </Group>
      ) : sessions.length === 0 ? (
        <Text size="sm" c="dimmed" ta="center" py="lg">
          No active sessions found.
        </Text>
      ) : (
        <Stack gap={0} className={classes.sessionList}>
          {sessions.map((session) => (
            <SessionRow
              key={session.id}
              session={session}
              busy={revokingId === session.id}
              onRevoke={() => revoke(session.id)}
            />
          ))}
        </Stack>
      )}
    </SettingsCard>
  );
}
