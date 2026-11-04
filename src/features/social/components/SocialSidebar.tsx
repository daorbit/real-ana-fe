import { useMemo } from "react";
import { InstagramMark, LinkedInMark } from "@/shared/ui/LinkedInMark";
import type { PostAccount, ScheduledPost } from "@/shared/types";
import { stageOf } from "../postStatus";
import { freeSlots, timeLabel } from "../postTime";
import classes from "./SocialQueue.module.css";

const WEEK_DAYS = 7;

function accountStatus(account: PostAccount | undefined) {
  if (!account?.connected) return { tone: "idle", label: "Not connected" };
  if (account.expired || account.canPublish === false) return { tone: "warn", label: "Needs reconnecting" };
  return { tone: "ok", label: "Connected" };
}

function AccountRow({
  network,
  label,
  account,
}: {
  network: "linkedin" | "instagram";
  label: string;
  account?: PostAccount;
}) {
  const status = accountStatus(account);
  const Mark = network === "instagram" ? InstagramMark : LinkedInMark;

  return (
    <div className={classes.account}>
      <span className={classes.accountMark} data-network={network} aria-hidden>
        <Mark size={18} color="#fff" />
      </span>
      <span className={classes.accountText}>
        <span className={classes.accountName}>{label}</span>
        {account?.name && <span className={classes.accountHandle}>{account.name}</span>}
      </span>
      <span className={classes.accountStatus}>
        <span className={classes.statusDot} data-tone={status.tone} />
        {status.label}
      </span>
    </div>
  );
}

function useWeekSummary(posts: ScheduledPost[]) {
  return useMemo(() => {
    const scheduled = posts.filter((p) => stageOf(p) === "scheduled" && p.mode !== "repeat");
    const next = scheduled
      .filter((p) => +new Date(p.nextRunAt) > Date.now())
      .sort((a, b) => +new Date(a.nextRunAt) - +new Date(b.nextRunAt))[0];

    let scheduledCount = 0;
    let openCount = 0;
    const cursor = new Date();
    cursor.setHours(0, 0, 0, 0);

    for (let i = 0; i < WEEK_DAYS; i++) {
      const key = cursor.toDateString();
      const dayPosts = scheduled.filter((p) => new Date(p.nextRunAt).toDateString() === key);
      scheduledCount += dayPosts.length;
      openCount += freeSlots(cursor.toISOString(), dayPosts).length;
      cursor.setDate(cursor.getDate() + 1);
    }

    return { next, scheduledCount, openCount };
  }, [posts]);
}

export function SocialSidebar({
  linkedin,
  instagram,
  showInstagram,
  posts,
  quota,
}: {
  linkedin?: PostAccount;
  instagram?: PostAccount;
  showInstagram: boolean;
  posts: ScheduledPost[];
  quota?: { used: number; quota: number };
}) {
  const { next, scheduledCount, openCount } = useWeekSummary(posts);

  return (
    <aside className={classes.side} aria-label="Accounts and this week">
      <section className={classes.day}>
        <h2 className={classes.dayTitle}>Accounts</h2>
        <div className={classes.card}>
          <AccountRow network="linkedin" label="LinkedIn" account={linkedin} />
          {showInstagram && <AccountRow network="instagram" label="Instagram" account={instagram} />}
        </div>
      </section>

      <section className={classes.day}>
        <h2 className={classes.dayTitle}>Next 7 days</h2>
        <dl className={`${classes.card} ${classes.weekList}`}>
          <div className={classes.weekRow}>
            <dt className={classes.weekKey}>Up next</dt>
            <dd className={classes.weekValue}>
              {next ? next.name : "Nothing scheduled"}
              {next && <span className={classes.weekHint}>{timeLabel(next.nextRunAt)}</span>}
            </dd>
          </div>
          <div className={classes.weekRow}>
            <dt className={classes.weekKey}>Scheduled</dt>
            <dd className={classes.weekValue}>{scheduledCount}</dd>
          </div>
          <div className={classes.weekRow}>
            <dt className={classes.weekKey}>Open slots</dt>
            <dd className={classes.weekValue}>{openCount}</dd>
          </div>
          {quota && (
            <div className={classes.weekRow}>
              <dt className={classes.weekKey}>Plan limit</dt>
              <dd className={classes.weekValue}>
                {quota.used} of {quota.quota} used
              </dd>
            </div>
          )}
        </dl>
      </section>
    </aside>
  );
}
