import type { TFunction } from "i18next";
import type { AppNotification, NotificationType } from "@/shared/types";

/**
 * Turning a stored notification into the sentence a reader sees.
 *
 * The backend stores `type` and `data`, never prose — the dashboard reads in
 * ten languages and the server has no idea which one applies. So the words live
 * here, behind `t()`, and `data` supplies the names and numbers.
 *
 * `admin.message` is the exception and always will be: an admin types its
 * subject and body into a form minutes before it sends, so there is nothing to
 * key a translation off. Those two fields are rendered as written.
 */

function str(data: Record<string, unknown>, key: string, fallback = ""): string {
  const value = data[key];
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function num(data: Record<string, unknown>, key: string): number | null {
  const value = Number(data[key]);
  return Number.isFinite(value) ? value : null;
}

export type NotificationCopy = {
  title: string;
  /** The supporting line. Empty when the title says everything. */
  body: string;
};

export function notificationCopy(
  notification: AppNotification,
  t: TFunction,
): NotificationCopy {
  const d = notification.data ?? {};

  switch (notification.type) {
    case "invite.received": {
      const workspace = str(d, "workspaceName", t("activity.aWorkspace", "a workspace"));
      const inviter = str(d, "inviterName");
      return {
        title: t("activity.inviteReceived.title", "You've been invited"),
        body: inviter
          ? t("activity.inviteReceived.body", "{{inviter}} invited you to {{workspace}}.", {
              inviter,
              workspace,
            })
          : t("activity.inviteReceived.bodyNoActor", "You've been invited to {{workspace}}.", {
              workspace,
            }),
      };
    }

    case "invite.accepted": {
      const who = str(d, "actorName", t("activity.someone", "Someone"));
      const workspace = str(d, "workspaceName", t("activity.yourWorkspace", "your workspace"));
      return {
        title: t("activity.inviteAccepted.title", "Invitation accepted"),
        body: t("activity.inviteAccepted.body", "{{who}} joined {{workspace}}.", { who, workspace }),
      };
    }

    case "member.removed": {
      const workspace = str(d, "workspaceName", t("activity.aWorkspace", "a workspace"));
      return {
        title: t("activity.memberRemoved.title", "Access removed"),
        body: t("activity.memberRemoved.body", "You no longer have access to {{workspace}}.", {
          workspace,
        }),
      };
    }

    case "role.changed": {
      const workspace = str(d, "workspaceName", t("activity.aWorkspace", "a workspace"));
      const role = str(d, "role");
      return {
        title: t("activity.roleChanged.title", "Your role changed"),
        body: role
          ? t("activity.roleChanged.body", "You are now {{role}} in {{workspace}}.", {
              role,
              workspace,
            })
          : t("activity.roleChanged.bodyNoRole", "Your role in {{workspace}} changed.", {
              workspace,
            }),
      };
    }

    case "report.ready": {
      const name = str(d, "reportName", t("activity.yourReport", "Your report"));
      return {
        title: t("activity.reportReady.title", "Report ready"),
        body: t("activity.reportReady.body", "{{name}} has been sent and is ready to read.", {
          name,
        }),
      };
    }

    case "plan.ending": {
      const workspace = str(d, "workspaceName", t("activity.yourWorkspace", "your workspace"));
      const days = num(d, "daysLeft");
      const when =
        days === null
          ? t("activity.soon", "soon")
          : days <= 1
            ? t("activity.tomorrow", "tomorrow")
            : t("activity.inDays", "in {{count}} days", { count: days });
      return {
        title: t("activity.planEnding.title", "Plan ending"),
        body: t("activity.planEnding.body", "The plan for {{workspace}} ends {{when}}.", {
          workspace,
          when,
        }),
      };
    }

    case "payment.received": {
      const amount = str(d, "amountLabel");
      return {
        title: t("activity.paymentReceived.title", "Payment received"),
        body: amount
          ? t("activity.paymentReceived.body", "We received your payment of {{amount}}.", { amount })
          : t("activity.paymentReceived.bodyNoAmount", "We received your payment."),
      };
    }

    case "payment.failed": {
      const amount = str(d, "amountLabel");
      const reason = str(d, "reason");
      return {
        title: t("activity.paymentFailed.title", "Payment failed"),
        body: reason
          ? t("activity.paymentFailed.bodyReason", "We couldn't take your payment: {{reason}}.", {
              reason,
            })
          : amount
            ? t("activity.paymentFailed.body", "We couldn't take your payment of {{amount}}.", {
                amount,
              })
            : t("activity.paymentFailed.bodyNoAmount", "We couldn't take your payment."),
      };
    }

    case "quota.exceeded": {
      const workspace = str(d, "workspaceName", t("activity.yourWorkspace", "your workspace"));
      const limit = num(d, "limit");
      return {
        title: t("activity.quotaExceeded.title", "Event limit reached"),
        body:
          limit === null
            ? t("activity.quotaExceeded.bodyNoLimit", "{{workspace}} has used its events for this cycle.", {
                workspace,
              })
            : t(
                "activity.quotaExceeded.body",
                "{{workspace}} has used all {{limit}} events for this cycle.",
                { workspace, limit: limit.toLocaleString() },
              ),
      };
    }

    case "tracking.stopped": {
      const site = str(d, "siteName", t("activity.yourSite", "your site"));
      const hours = num(d, "hoursSilent");
      return {
        title: t("activity.trackingStopped.title", "Tracking stopped"),
        body:
          hours === null
            ? t("activity.trackingStopped.bodyNoTime", "{{site}} has stopped sending events.", { site })
            : t(
                "activity.trackingStopped.body",
                "{{site}} has sent no events for {{count}} hours.",
                { site, count: hours },
              ),
      };
    }

    case "social.post.failed": {
      const channel = str(d, "channel");
      return {
        title: t("activity.socialPostFailed.title", "Post didn't go out"),
        body: channel
          ? t("activity.socialPostFailed.body", "A scheduled post to {{channel}} failed to send.", {
              channel,
            })
          : t("activity.socialPostFailed.bodyNoChannel", "A scheduled post failed to send."),
      };
    }

    case "lead.captured": {
      const formTitle = str(d, "formTitle", t("activity.aForm", "a form"));
      const who = str(d, "leadName") || str(d, "leadEmail");
      return {
        title: t("activity.leadCaptured.title", "New lead from {{form}}", { form: formTitle }),
        body: who,
      };
    }

    case "seo.rank.changed": {
      const keyword = str(d, "keyword", t("activity.aKeyword", "a keyword"));
      const rival = str(d, "competitorName");
      const gained = Boolean(d.gained);
      return {
        title: gained
          ? t("activity.seoRankChanged.titleUp", "You moved up")
          : t("activity.seoRankChanged.titleDown", "You slipped"),
        body: rival
          ? gained
            ? t("activity.seoRankChanged.bodyUp", "You overtook {{rival}} on “{{keyword}}”.", {
                rival,
                keyword,
              })
            : t("activity.seoRankChanged.bodyDown", "{{rival}} overtook you on “{{keyword}}”.", {
                rival,
                keyword,
              })
          : t("activity.seoRankChanged.bodyNoRival", "Your ranking for “{{keyword}}” changed.", {
              keyword,
            }),
      };
    }

    case "seo.audit.done": {
      const site = str(d, "siteName", t("activity.yourSite", "your site"));
      return {
        title: t("activity.seoAuditDone.title", "Audit finished"),
        body: t("activity.seoAuditDone.body", "The SEO audit for {{site}} is ready.", { site }),
      };
    }

    case "admin.message":
      // Authored, not translated — see the note at the top of this file.
      return {
        title: str(d, "subject", t("activity.adminMessage.title", "A message for you")),
        body: str(d, "body"),
      };

    case "security.alert":
      return {
        title: t("activity.securityAlert.title", "Security alert"),
        body: str(d, "what", t("activity.securityAlert.body", "Something changed on your account.")),
      };

    case "form.submission": {
      const formTitle = str(d, "formTitle", t("activity.aForm", "a form"));
      const answers = Array.isArray(d.answers) ? (d.answers as { label: string; value: string }[]) : [];
      const preview = answers
        .slice(0, 2)
        .map((a) => a.value)
        .filter(Boolean)
        .join(", ");
      return {
        title: t("activity.formSubmission.title", "New submission on {{form}}", { form: formTitle }),
        body: preview,
      };
    }
  }
}

/**
 * The label for a notification's type, used by the preferences screen.
 *
 * Separate from the copy above because it names the *category* rather than one
 * event: "Reports", not "your Tuesday report is ready".
 */
export function notificationTypeLabel(type: NotificationType, t: TFunction): string {
  const labels: Record<NotificationType, [string, string]> = {
    "invite.received": ["activity.pref.inviteReceived", "Invitations to you"],
    "invite.accepted": ["activity.pref.inviteAccepted", "People joining your workspaces"],
    "member.removed": ["activity.pref.memberRemoved", "Losing access to a workspace"],
    "role.changed": ["activity.pref.roleChanged", "Changes to your role"],
    "report.ready": ["activity.pref.reportReady", "Scheduled reports"],
    "plan.ending": ["activity.pref.planEnding", "Plan expiry reminders"],
    "payment.received": ["activity.pref.paymentReceived", "Payments and receipts"],
    "payment.failed": ["activity.pref.paymentFailed", "Failed payments"],
    "quota.exceeded": ["activity.pref.quotaExceeded", "Event limit warnings"],
    "seo.audit.done": ["activity.pref.seoAuditDone", "Finished SEO audits"],
    "seo.rank.changed": ["activity.pref.seoRankChanged", "Competitor ranking changes"],
    "tracking.stopped": ["activity.pref.trackingStopped", "Tracking outages"],
    "social.post.failed": ["activity.pref.socialPostFailed", "Failed scheduled posts"],
    "lead.captured": ["activity.pref.leadCaptured", "New leads"],
    "admin.message": ["activity.pref.adminMessage", "Product announcements"],
    "security.alert": ["activity.pref.securityAlert", "Security alerts"],
    "form.submission": ["activity.pref.formSubmission", "Form submissions"],
  };

  const [key, fallback] = labels[type];
  return t(key, fallback);
}

/**
 * The relative time on a row, at the resolution the panel actually needs.
 *
 * Deliberately not a library: the panel shows minutes, hours, days and then
 * gives up and shows a date, which is a dozen lines here against a dependency
 * that would arrive with its own locale data for all ten languages.
 */
export function relativeTime(iso: string, t: TFunction, locale: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";

  const seconds = Math.max(0, Math.round((Date.now() - then) / 1000));
  if (seconds < 60) return t("activity.justNow", "just now");

  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return t("activity.minutesAgo", "{{count}}m ago", { count: minutes });

  const hours = Math.round(minutes / 60);
  if (hours < 24) return t("activity.hoursAgo", "{{count}}h ago", { count: hours });

  const days = Math.round(hours / 24);
  if (days < 7) return t("activity.daysAgo", "{{count}}d ago", { count: days });

  // Past a week, "14d ago" stops being easier to read than the date itself.
  return new Date(iso).toLocaleDateString(locale || undefined, {
    day: "numeric",
    month: "short",
  });
}

/**
 * Which heading a row sits under.
 *
 * Grouping by recency rather than by date: a feed of bare dates makes the
 * reader do the arithmetic to work out whether something is new.
 */
export type DateGroup = "today" | "yesterday" | "week" | "earlier";

export function dateGroup(iso: string): DateGroup {
  const then = new Date(iso);
  if (Number.isNaN(then.getTime())) return "earlier";

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  if (then.getTime() >= startOfToday.getTime()) return "today";

  const startOfYesterday = new Date(startOfToday);
  startOfYesterday.setDate(startOfYesterday.getDate() - 1);
  if (then.getTime() >= startOfYesterday.getTime()) return "yesterday";

  const weekAgo = new Date(startOfToday);
  weekAgo.setDate(weekAgo.getDate() - 7);
  if (then.getTime() >= weekAgo.getTime()) return "week";

  return "earlier";
}

export function dateGroupLabel(group: DateGroup, t: TFunction): string {
  switch (group) {
    case "today":
      return t("activity.group.today", "Today");
    case "yesterday":
      return t("activity.group.yesterday", "Yesterday");
    case "week":
      return t("activity.group.week", "This week");
    case "earlier":
      return t("activity.group.earlier", "Earlier");
  }
}
