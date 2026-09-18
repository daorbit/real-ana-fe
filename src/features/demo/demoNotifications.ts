import type { AppNotification, NotificationPage } from "@/shared/types";

/**
 * A populated activity panel for demo mode.
 *
 * Same reasoning as `demoStats`: an account with no history yet should not
 * show the notification panel empty while every other widget is full of
 * sample numbers. Display-only — these rows are never sent anywhere, and
 * their ids are namespaced so a real "mark as read" click can never collide
 * with one.
 *
 * Fixed timestamps relative to render time, not a seeded RNG like the stats —
 * a handful of rows reads fine without needing to look identical byte for
 * byte on every reload.
 */

const MIN = 60 * 1000;

function ago(ms: number): string {
  return new Date(Date.now() - ms).toISOString();
}

function row(
  id: string,
  minutesAgo: number,
  rest: Omit<AppNotification, "id" | "createdAt" | "seenAt" | "readAt">,
  read: boolean,
): AppNotification {
  const createdAt = ago(minutesAgo * MIN);
  return {
    id: `demo-${id}`,
    createdAt,
    seenAt: read ? createdAt : null,
    readAt: read ? createdAt : null,
    ...rest,
  };
}

export function demoNotifications(): NotificationPage {
  const items: AppNotification[] = [
    row(
      "invite",
      12,
      {
        type: "invite.received",
        data: { inviterName: "Priya Shah", workspaceName: "Acme Growth" },
        link: "/invite/demo-token",
        workspaceId: null,
        actorId: "demo-actor-1",
      },
      false,
    ),
    row(
      "report",
      55,
      {
        type: "report.ready",
        data: { reportName: "Weekly traffic summary" },
        link: "/app/analytics",
        workspaceId: "demo-workspace",
        actorId: null,
      },
      false,
    ),
    row(
      "payment",
      3 * 60,
      {
        type: "payment.received",
        data: { amountLabel: "$49.00" },
        link: "/app/settings?tab=billing",
        workspaceId: "demo-workspace",
        actorId: null,
      },
      true,
    ),
    row(
      "audit",
      9 * 60,
      {
        type: "seo.audit.done",
        data: { siteName: "acme.com" },
        link: "/app/analytics",
        workspaceId: "demo-workspace",
        actorId: null,
      },
      true,
    ),
    row(
      "plan",
      26 * 60,
      {
        type: "plan.ending",
        data: { workspaceName: "Acme Growth", daysLeft: 3 },
        link: "/app/settings?tab=billing",
        workspaceId: "demo-workspace",
        actorId: null,
      },
      true,
    ),
    row(
      "joined",
      2 * 24 * 60,
      {
        type: "invite.accepted",
        data: { actorName: "Diego Ramirez", workspaceName: "Acme Growth", role: "editor" },
        link: "/app/settings/members",
        workspaceId: "demo-workspace",
        actorId: "demo-actor-2",
      },
      true,
    ),
  ];

  return { items, nextCursor: null };
}

export function demoNotificationCount(): { count: number } {
  return { count: demoNotifications().items.filter((n) => !n.seenAt).length };
}
