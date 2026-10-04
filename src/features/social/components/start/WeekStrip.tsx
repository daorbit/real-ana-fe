import { UnstyledButton } from "@mantine/core";
import { Plus } from "lucide-react";
import { toDateInput } from "@/features/social/components/draft";
import classes from "./SocialStart.module.css";

const SAMPLE: Record<number, { time: string; title: string }> = {
  1: { time: "10:00", title: "Product update" },
  3: { time: "14:30", title: "5 quick SEO wins" },
  5: { time: "09:00", title: "Customer story" },
};

function nextDays(count: number): Date[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    return d;
  });
}

export function WeekStrip({
  interactive,
  onPickDay,
}: {
  interactive: boolean;
  onPickDay: (date: string) => void;
}) {
  const days = nextDays(7);

  return (
    <section className={classes.week} aria-labelledby="social-week-title">
      <header className={classes.weekHead}>
        <div>
          <h3 id="social-week-title" className={classes.weekTitle}>
            {interactive ? "Your next 7 days" : "What a scheduled week looks like"}
          </h3>
          <p className={classes.weekSub}>
            {interactive
              ? "Pick a day to write a post for it. You can change the time before it's saved."
              : "Once an account is connected, posts queue up here and publish on their own."}
          </p>
        </div>
        {!interactive && <span className={classes.weekBadge}>Example</span>}
      </header>

      <div className={classes.days}>
        {days.map((day, i) => {
          const label = i === 0 ? "Today" : day.toLocaleDateString(undefined, { weekday: "short" });
          const sample = SAMPLE[i];
          const head = (
            <span className={classes.dayHead}>
              <span className={classes.dayName}>{label}</span>
              <span className={classes.dayNumber}>{day.getDate()}</span>
            </span>
          );

          if (interactive) {
            return (
              <UnstyledButton
                key={i}
                className={classes.day}
                data-today={i === 0 || undefined}
                data-interactive
                onClick={() => onPickDay(toDateInput(day))}
                aria-label={`Schedule a post for ${day.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}`}
              >
                {head}
                <span className={classes.slot}>
                  <Plus size={14} />
                  Add post
                </span>
              </UnstyledButton>
            );
          }

          return (
            <div key={i} className={classes.day} data-today={i === 0 || undefined} aria-hidden>
              {head}
              {sample ? (
                <span className={classes.post}>
                  <span className={classes.postTime}>{sample.time}</span>
                  <span className={classes.postTitle}>{sample.title}</span>
                </span>
              ) : (
                <span className={classes.emptySlot} />
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
