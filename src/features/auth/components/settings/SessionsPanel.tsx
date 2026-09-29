import { Badge, Button, Group, Loader, Stack, Text } from "@mantine/core";
import { Laptop, Monitor, Smartphone, Tablet, type LucideIcon } from "lucide-react";
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
    <Group justify="space-between" wrap="nowrap" className={classes.sessionRow}>
      <Group gap={12} wrap="nowrap">
        <span className={classes.sessionIcon}>
          <Icon size={18} />
        </span>
        <Stack gap={2}>
          <Group gap={8}>
            <Text size="sm" fw={600}>
              {deviceLabel(session)}
            </Text>
            {session.current && (
              <Badge size="xs" variant="light" color="green">
                Current session
              </Badge>
            )}
          </Group>
          <Text size="xs" c="dimmed">
            {[session.location, session.current ? "Active now" : timeAgo(session.lastSeenAt)]
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
      body: "Every other device currently signed in to your account will be signed out immediately.",
      confirmLabel: "Sign out others",
      confirmColor: "red",
      onConfirm: revokeOthers,
    });
  };

  return (
    <SettingsCard
      title="Active sessions"
      description="Devices currently signed in to your account."
      action={
        hasOthers && (
          <Button variant="default" size="xs" loading={revokingOthers} onClick={confirmRevokeOthers}>
            Sign out of all other sessions
          </Button>
        )
      }
    >
      {loading ? (
        <Group justify="center" py="md">
          <Loader size="sm" />
        </Group>
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
