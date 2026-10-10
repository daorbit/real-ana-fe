import type { AuditEntry } from "@/shared/types";

type Describe = (entry: AuditEntry) => string;

const role = (value: unknown) => {
  const text = String(value ?? "");
  return text ? text.charAt(0).toUpperCase() + text.slice(1) : "";
};

const quoted = (label: string, fallback: string) => (label ? `“${label}”` : fallback);

const plural = (count: unknown, noun: string) => {
  const n = Number(count) || 0;
  return `${n} ${noun}${n === 1 ? "" : "s"}`;
};

const named = (verb: string, e: AuditEntry) => (e.target.label ? `${verb} “${e.target.label}”` : verb);

const LOGIN_METHODS: Record<string, string> = {
  password: "with a password",
  google: "with Google",
  "2fa": "with two-factor authentication",
  backup_code: "with a backup code",
};

const APP_NAMES: Record<string, string> = {
  brevo: "Brevo",
  smtp: "Custom SMTP",
  slack: "Slack",
  discord: "Discord",
  webhook: "Webhook",
};

const appName = (e: AuditEntry) => APP_NAMES[e.target.id] ?? e.target.label ?? "an app";

const providerName = (value: unknown) => {
  const text = String(value ?? "");
  if (text === "payu") return "PayU";
  return role(text) || "payment";
};

const TEAM_COPY: Record<string, Describe> = {
  "member.invited": (e) => `invited ${e.target.label} as ${role(e.meta.role)}`,
  "member.invite_withdrawn": (e) => `withdrew the invitation for ${e.target.label}`,
  "member.joined": (e) => `joined as ${role(e.meta.role)}`,
  "member.role_changed": (e) =>
    `changed ${e.target.label || "a member"}’s role from ${role(e.meta.from)} to ${role(e.meta.to)}`,
  "member.removed": (e) => `removed ${e.target.label || "a member"} from the workspace`,
  "member.left": () => "left the workspace",

  "workspace.created": (e) => `created the workspace ${quoted(e.target.label, "")}`.trim(),
  "workspace.renamed": (e) => `renamed the workspace from “${e.meta.from}” to “${e.meta.to}”`,
  "workspace.share_updated": (e) =>
    e.meta.rotated
      ? "reset the public dashboard link"
      : e.meta.enabled
        ? "turned on the public dashboard"
        : "turned off the public dashboard",

  "workspace.changed": (e) => `made a change in ${String(e.meta.route ?? "the workspace").replace(/^\//, "")}`,
  "branding.updated": () => "updated the workspace branding",
  "sidebar.updated": () => "changed the shared sidebar",
  "media.uploaded": (e) => `uploaded ${quoted(e.target.label, "a file")} to the media library`,
  "media.renamed": (e) => `renamed ${quoted(e.target.label, "a file")} in the media library`,
  "media.deleted": (e) => `deleted ${quoted(e.target.label, "a file")} from the media library`,
  "media.bulk_deleted": (e) => `deleted ${plural(e.meta.count, "file")} from the media library`,

  "goal.created": (e) => named("created the goal", e),
  "goal.updated": (e) => named("edited the goal", e),
  "goal.deleted": (e) => named("deleted the goal", e),
  "dashboard.created": (e) => named("created the dashboard", e),
  "dashboard.updated": (e) => named("edited the dashboard", e),
  "dashboard.duplicated": (e) => named("duplicated a dashboard as", e),
  "dashboard.deleted": (e) => named("deleted the dashboard", e),
  "embed.created": (e) => named("created the embedded widget", e),
  "embed.updated": (e) => named("edited the embedded widget", e),
  "embed.deleted": (e) => named("deleted the embedded widget", e),
  "report.created": (e) => named("scheduled the report", e),
  "report.updated": (e) => named("edited the report", e),
  "report.deleted": (e) => named("deleted the report", e),
  "report.test_sent": (e) => named("sent a test of the report", e),
  "segment.created": (e) => named("saved the segment", e),
  "segment.updated": (e) => named("edited the segment", e),
  "segment.deleted": (e) => named("deleted the segment", e),
  "marker.created": (e) => named("added the marker", e),
  "marker.updated": (e) => named("edited the marker", e),
  "marker.deleted": (e) => named("deleted the marker", e),
  "funnel.created": (e) => named("saved the funnel", e),
  "funnel.updated": (e) => named("edited the funnel", e),
  "funnel.deleted": (e) => named("deleted the funnel", e),

  "seo.audit_run": (e) => named("ran an SEO audit of", e),
  "seo.crawl_run": () => "started a site crawl",
  "seo.report_deleted": (e) => named("deleted the SEO report for", e),
  "seo.report_shared": (e) => named("changed sharing for the SEO report of", e),
  "competitor.added": (e) => named("started tracking the competitor", e),
  "competitor.removed": (e) => named("stopped tracking the competitor", e),
  "backlink.removed": (e) => named("removed the backlink from", e),
  "search_console.disconnected": () => "disconnected Google Search Console",
  "search_console.linked": () => "linked a Search Console property to a site",
  "search_console.unlinked": () => "unlinked Search Console from a site",
  "sitemap.submitted": () => "submitted a sitemap to Google",
  "sitemap.removed": () => "removed a sitemap from Google",

  "site.added": (e) => `added the site ${quoted(e.target.label, "")}`.trim(),
  "site.removed": (e) => `removed the site ${quoted(e.target.label, "")} and its data`.trim(),

  "api_key.created": (e) => `created the API key ${quoted(e.target.label, "")}`.trim(),
  "api_key.updated": (e) => `renamed an API key to ${quoted(e.target.label, "")}`.trim(),
  "api_key.revoked": (e) => `revoked the API key ${quoted(e.target.label, "")}`.trim(),

  "form.created": (e) => `created the form ${quoted(e.target.label, "")}`.trim(),
  "form.duplicated": (e) => `duplicated a form as ${quoted(e.target.label, "")}`.trim(),
  "form.imported": (e) => `imported the form ${quoted(e.target.label, "")}`.trim(),
  "form.published": (e) => `published ${quoted(e.target.label, "a form")}`,
  "form.unpublished": (e) => `unpublished ${quoted(e.target.label, "a form")}`,
  "form.deleted": (e) => `deleted the form ${quoted(e.target.label, "")} and its responses`.trim(),
  "form.submission_deleted": (e) => `deleted a response from ${quoted(e.target.label, "a form")}`,
  "form.submissions_deleted": (e) =>
    `deleted ${plural(e.meta.count, "response")} from ${quoted(e.target.label, "a form")}`,
  "form.payments_updated": (e) =>
    e.meta.credentialsChanged
      ? `changed the ${providerName(e.meta.provider)} payment keys`
      : `updated ${providerName(e.meta.provider)} payment settings`,
  "form.payments_disconnected": (e) =>
    `disconnected ${providerName(e.meta.provider)} ${e.meta.mode ? `${e.meta.mode} mode` : ""}`.trim(),
  "form.app_connected": (e) => `connected ${appName(e)} to lead capture`,
  "form.app_disconnected": (e) => `disconnected ${appName(e)} from lead capture`,
  "form.webhook_updated": (e) => (e.meta.enabled ? "turned on the webhook app" : "turned off the webhook app"),
};

const SELF_COPY: Record<string, Describe> = {
  "account.login": (e) => `Signed in ${LOGIN_METHODS[String(e.meta.method)] ?? ""}`.trim(),
  "account.login_locked": () => "Sign-in was locked after five wrong passwords",
  "account.2fa_enabled": () => "Turned on two-factor authentication",
  "account.2fa_disabled": () => "Turned off two-factor authentication",
  "account.password_changed": () => "Changed your password",
  "account.password_reset": () => "Reset your password by email",
  "account.session_revoked": (e) => `Signed out ${e.target.label || "a session"}`,
  "account.sessions_revoked": (e) => `Signed out ${plural(e.meta.count, "other session")}`,
  "account.screen_lock_enabled": () => "Turned on the screen lock",
  "account.screen_lock_disabled": () => "Turned off the screen lock",
  "account.impersonated": () => "Quantalog support opened your account",
};

export function describeTeamAction(entry: AuditEntry): string {
  return TEAM_COPY[entry.action]?.(entry) ?? entry.action.replace(/[._]/g, " ");
}

export function describeOwnAction(entry: AuditEntry): string {
  return SELF_COPY[entry.action]?.(entry) ?? entry.action.replace(/[._]/g, " ");
}

export function actorName(entry: AuditEntry): string {
  if (!entry.actor) return "System";
  if (entry.actor.deleted) return "A deleted user";
  return entry.actor.name || entry.actor.email || "Someone";
}

export function deviceLine(entry: AuditEntry): string {
  const device = [entry.browser, entry.os].filter(Boolean).join(" on ");
  return [device, entry.location].filter(Boolean).join(" · ");
}
