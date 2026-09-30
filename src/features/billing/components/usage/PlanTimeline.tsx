import { Badge, Text } from "@mantine/core";
import type { UsagePlanEvent } from "@/shared/types";
import classes from "./UsageOverview.module.css";

function purchaseDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

export function PlanTimeline({ plans }: { plans: UsagePlanEvent[] }) {
  return (
    <section className={classes.card}>
      <header className={classes.cardHead}>
        <div>
          <Text fw={650} size="sm">
            Plan history
          </Text>
          <Text size="xs" c="dimmed" mt={2}>
            Every plan bought for this workspace, newest first.
          </Text>
        </div>
      </header>

      {plans.length === 0 ? (
        <Text size="xs" c="dimmed">
          No plans bought yet. This workspace has been on Free.
        </Text>
      ) : (
        <ol className={classes.timeline}>
          {plans.map((p, i) => (
            <li key={`${p.purchasedAt}-${p.planSlug}-${i}`} className={classes.timelineItem}>
              <span className={classes.timelineDot} data-ladder={p.ladder} />
              <div className={classes.timelineText}>
                <Text size="sm" fw={600}>
                  {p.planName}{" "}
                  <Badge size="xs" variant="light" color={p.ladder === "orbit" ? "violet" : "gray"} ml={4}>
                    {p.ladder === "orbit" ? "Orbit AI" : "Analytics"}
                  </Badge>
                </Text>
                <Text size="xs" c="dimmed">
                  {p.cycle === "yearly" ? "Yearly" : "Monthly"} plan
                </Text>
              </div>
              <span className={classes.timelineDate}>{purchaseDate(p.purchasedAt)}</span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
