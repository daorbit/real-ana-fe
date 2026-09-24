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

/** A stable placeholder photo per demo person, keyed so the same name always gets the same face. */
function avatar(seed: string): string {
  return `https://i.pravatar.cc/100?u=${seed}`;
}

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
        data: {
          inviterName: "Priya Shah",
          actorAvatarUrl: avatar("demo-priya-shah"),
          workspaceName: "Acme Growth",
        },
        link: "/invite/demo-token",
        workspaceId: null,
        actorId: "demo-actor-1",
      },
      false,
    ),
    // The one failure that is invisible from the dashboard, so it leads the
    // unread rows — see its spec in the server's notification registry.
    row(
      "tracking",
      24,
      {
        type: "tracking.stopped",
        data: { siteName: "acme.com", hoursSilent: 6 },
        link: "/app/developers",
        workspaceId: "demo-workspace",
        actorId: null,
      },
      false,
    ),
    row(
      "lead",
      38,
      {
        type: "lead.captured",
        data: {
          formTitle: "Pricing enquiry",
          leadName: "Marcus Webb",
          leadEmail: "marcus@northwind.io",
        },
        link: "/app/lead-capture",
        workspaceId: "demo-workspace",
        actorId: null,
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
      "quota",
      90,
      {
        type: "quota.exceeded",
        data: { workspaceName: "Acme Growth", limit: 100000 },
        link: "/app/billing",
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
        link: "/app/billing",
        workspaceId: "demo-workspace",
        actorId: null,
      },
      true,
    ),
    row(
      "payment-failed",
      5 * 60,
      {
        type: "payment.failed",
        data: { amountLabel: "$49.00", reason: "card expired" },
        link: "/app/billing",
        workspaceId: "demo-workspace",
        actorId: null,
      },
      true,
    ),
    row(
      "social",
      7 * 60,
      {
        type: "social.post.failed",
        data: { channel: "LinkedIn" },
        link: "/app/social",
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
      "rank",
      11 * 60,
      {
        type: "seo.rank.changed",
        data: {
          keyword: "site speed monitoring",
          competitorName: "Northwind",
          gained: true,
        },
        link: "/app/compare",
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
        link: "/app/billing",
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
        data: {
          actorName: "Diego Ramirez",
          actorAvatarUrl: avatar("demo-diego-ramirez"),
          workspaceName: "Acme Growth",
          role: "editor",
        },
        link: "/app/members",
        workspaceId: "demo-workspace",
        actorId: "demo-actor-2",
      },
      true,
    ),
    row(
      "submission",
      2 * 24 * 60 + 90,
      {
        type: "form.submission",
        data: {
          formTitle: "Interview feedback",
          answers: [
            { label: "Name", value: "Hinata Tachibana" },
            { label: "Email", value: "hinata@tachibana.dev" },
            { label: "How did it go?", value: "Strong on the systems round." },
          ],
        },
        link: "",
        workspaceId: "demo-workspace",
        actorId: null,
      },
      true,
    ),
    row(
      "security",
      3 * 24 * 60,
      {
        type: "security.alert",
        data: { what: "A new sign-in from Chrome on Windows, from Pune, India." },
        link: "/app/settings/security",
        workspaceId: null,
        actorId: null,
      },
      true,
    ),
    row(
      "announcement",
      3 * 24 * 60 + 240,
      {
        // Authored prose, not translated — the one type whose words the server
        // owns, because an admin types them into a form before it sends.
        type: "admin.message",
        data: {
          subject: "User journeys is out of beta",
          body: "Session replays now stitch across subdomains. Nothing to turn on.",
        },
        link: "/app/journey",
        workspaceId: null,
        actorId: null,
      },
      true,
    ),
    row(
      "role",
      4 * 24 * 60,
      {
        type: "role.changed",
        data: { workspaceName: "Acme Growth", role: "admin" },
        link: "/app/members",
        workspaceId: "demo-workspace",
        actorId: null,
      },
      true,
    ),
    row(
      "removed",
      9 * 24 * 60,
      {
        type: "member.removed",
        data: { workspaceName: "Northwind Labs" },
        // Nowhere to send someone whose access to it has just ended.
        link: "",
        workspaceId: null,
        actorId: null,
      },
      true,
    ),
  ];

  return { items, nextCursor: null };
}

export function demoNotificationCount(): { count: number } {
  return { count: demoNotifications().items.filter((n) => !n.seenAt).length };
}
