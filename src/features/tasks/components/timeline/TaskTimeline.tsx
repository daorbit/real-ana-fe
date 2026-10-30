import { Fragment, useMemo, useState } from "react";
import { ActionIcon, Button, UnstyledButton } from "@mantine/core";
import { ChartGantt, ChevronLeft, ChevronRight } from "lucide-react";
import { EmptyState } from "@/shared/ui/EmptyState";
import { taskKey } from "../../lib/board";
import { addDays, startOfWeek } from "../../lib/dates";
import { layoutTimeline, TIMELINE_DAYS, TIMELINE_STEP, timelineDays } from "../../lib/timeline";
import type { Bucket, Task } from "../../types";
import { TimelineChart } from "./TimelineChart";
import classes from "./Timeline.module.css";

function defaultStart(): Date {
  return addDays(startOfWeek(new Date()), -7);
}

function rangeTitle(from: Date): string {
  const format = (d: Date) => d.toLocaleDateString(undefined, { day: "numeric", month: "short" });
  return `${format(from)} – ${format(addDays(from, TIMELINE_DAYS - 1))}`;
}

export function TaskTimeline({ tasks, buckets, onOpen }: { tasks: Task[]; buckets: Bucket[]; onOpen: (task: Task) => void }) {
  const [from, setFrom] = useState(defaultStart);
  const layout = useMemo(() => layoutTimeline(tasks, buckets, from), [tasks, buckets, from]);
  const days = useMemo(() => timelineDays(from), [from]);

  return (
    <div className={classes.wrap}>
      <header className={classes.head}>
        <span className={classes.range}>{rangeTitle(from)}</span>
        <span className={classes.nav}>
          <Button size="xs" variant="default" onClick={() => setFrom(defaultStart())}>
            Today
          </Button>
          <ActionIcon variant="subtle" color="gray" onClick={() => setFrom((d) => addDays(d, -TIMELINE_STEP))} aria-label="Earlier">
            <ChevronLeft size={18} />
          </ActionIcon>
          <ActionIcon variant="subtle" color="gray" onClick={() => setFrom((d) => addDays(d, TIMELINE_STEP))} aria-label="Later">
            <ChevronRight size={18} />
          </ActionIcon>
        </span>
      </header>

      {layout.groups.length === 0 ? (
        <EmptyState
          compact
          minHeight="30vh"
          icon={ChartGantt}
          title="Nothing to plot yet"
          description="Give tasks a start or due date and they appear here as bars, with arrows between linked tasks."
        />
      ) : (
        <div className={classes.timeline}>
          <div className={classes.names}>
            <div className={classes.namesHead}>Task</div>
            {layout.groups.map((group) => (
              <Fragment key={group.bucket.id}>
                <div className={classes.groupName}>{group.bucket.name}</div>
                {group.bars.map(({ task }) => (
                  <UnstyledButton key={task.id} className={classes.name} onClick={() => onOpen(task)}>
                    <span className={classes.nameKey}>{taskKey(task.key)}</span>
                    <span className={classes.nameTitle} data-done={task.status === "done" || undefined}>
                      {task.title}
                    </span>
                  </UnstyledButton>
                ))}
              </Fragment>
            ))}
          </div>
          <div className={classes.scroll}>
            <TimelineChart layout={layout} days={days} from={from} onOpen={onOpen} />
          </div>
        </div>
      )}

      {layout.unscheduled > 0 && (
        <span className={classes.note}>
          {layout.unscheduled} {layout.unscheduled === 1 ? "task has" : "tasks have"} no dates and {layout.unscheduled === 1 ? "isn't" : "aren't"} shown.
        </span>
      )}
    </div>
  );
}
