import { Button, Loader } from "@mantine/core";
import { Laptop, LogOut, Monitor, Smartphone, Tablet, type LucideIcon } from "lucide-react";
import { SecurityGroup, SecurityLinkRow, SecurityRow } from "./SecurityGroup";
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

function SessionRow({ session, busy, onRevoke }: { session: Session; busy: boolean; onRevoke: () => void }) {
  return (
    <SecurityRow
      icon={deviceIcon(session.device)}
      hue={session.current ? "green" : "slate"}
      title={deviceLabel(session)}
      status={session.current && <span className={classes.current}>This device</span>}
      description={[session.location, session.current ? "Active now" : `Active ${timeAgo(session.lastSeenAt)}`]
        .filter(Boolean)
        .join(" · ")}
      action={
        !session.current && (
          <Button variant="subtle" color="red" size="xs" radius="xl" loading={busy} onClick={onRevoke}>
            Revoke
          </Button>
        )
      }
    />
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
    <SecurityGroup
      label={loading ? "Where you're signed in" : `Where you're signed in · ${sessions.length}`}
      footer="Revoke any device you don't recognise, then change your password."
    >
      {loading ? (
        <div className={classes.loading}>
          <Loader size="sm" />
        </div>
      ) : sessions.length === 0 ? (
        <p className={classes.empty}>No active sessions found.</p>
      ) : (
        <>
          {sessions.map((session) => (
            <SessionRow
              key={session.id}
              session={session}
              busy={revokingId === session.id}
              onRevoke={() => revoke(session.id)}
            />
          ))}
          {hasOthers && (
            <SecurityLinkRow
              icon={LogOut}
              label={revokingOthers ? "Signing out…" : "Sign out of all other devices"}
              busy={revokingOthers}
              onClick={confirmRevokeOthers}
            />
          )}
        </>
      )}
    </SecurityGroup>
  );
}
