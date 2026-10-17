import { Calendar, Crown, Globe, Users } from "lucide-react";
import { num, shortDate, timeAgo } from "@/shared/lib";
import type { AdminUserWorkspace } from "@/shared/types";
import classes from "./userDetail.module.css";

const APP_LABEL: Record<string, string> = {
  compare: "Compare",
  goals: "Goals",
  notes: "Notes",
  reviews: "Reviews",
  links: "Links",
  media: "Media",
};

function planTone(plan: AdminUserWorkspace["plan"]): string | undefined {
  if (!plan) return undefined;
  if (plan.expired) return "expired";
  return plan.slug === "free" ? undefined : "paid";
}

export function WorkspaceCard({ workspace: ws }: { workspace: AdminUserWorkspace }) {
  return (
    <div className={classes.card}>
      <div className={classes.wsHead}>
        <div>
          <div className={classes.wsName}>
            {ws.name}
            <span className={classes.pill} data-tone={ws.role === "owner" ? "owner" : undefined}>
              {ws.role}
            </span>
            <span className={classes.pill} data-tone={planTone(ws.plan)}>
              {ws.plan ? `${ws.plan.name}${ws.plan.expired ? " · expired" : ""}` : "No plan"}
            </span>
          </div>
          <div className={classes.wsMeta}>
            <span>
              <Globe size={12} aria-hidden />
              {ws.sites.length} {ws.sites.length === 1 ? "site" : "sites"}
            </span>
            <span>
              <Users size={12} aria-hidden />
              {ws.members} {ws.members === 1 ? "member" : "members"}
            </span>
            <span>
              <Calendar size={12} aria-hidden />
              Created {shortDate(ws.createdAt)}
            </span>
            {ws.owner && (
              <span>
                <Crown size={12} aria-hidden />
                Owned by {ws.owner.name || ws.owner.email}
              </span>
            )}
            {ws.plan?.renewsAt && !ws.plan.expired && <span>Renews {shortDate(ws.plan.renewsAt)}</span>}
          </div>
        </div>
        <div className={classes.wsEvents}>
          <div className={classes.wsEventsValue}>{num(ws.events30d)}</div>
          <div className={classes.wsEventsLabel}>events · 30 days</div>
        </div>
      </div>

      {ws.apps.length > 0 && (
        <div className={classes.apps}>
          {ws.apps.map((app) => (
            <span key={app} className={classes.pill}>
              {APP_LABEL[app] ?? app}
            </span>
          ))}
        </div>
      )}

      {ws.sites.length ? (
        <div className={classes.sites}>
          <div className={`${classes.siteRow} ${classes.siteHeadRow}`}>
            <span>Site</span>
            <span className={classes.num}>Events</span>
            <span className={classes.num}>Last event</span>
          </div>
          {ws.sites.map((site) => (
            <div key={site.id} className={classes.siteRow}>
              <div className={classes.siteName}>
                <span>{site.name}</span>
                <span className={classes.siteDomain}>
                  {site.domain || (site.platform === "app" ? "Mobile app" : "No domain")}
                </span>
              </div>
              <span className={classes.num}>{num(site.events30d)}</span>
              <span className={classes.num}>{site.lastEventAt ? timeAgo(site.lastEventAt) : "No events"}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className={classes.noSites}>No sites in this workspace yet.</div>
      )}
    </div>
  );
}
