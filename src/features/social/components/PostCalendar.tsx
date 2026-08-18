import { useMemo, useState } from "react";
import { ActionIcon, Box, Button, Group, Text, Tooltip } from "@mantine/core";
import { ChevronLeft, ChevronRight, Plus, Repeat } from "lucide-react";
import { toDateInput } from "./draft";
import type { ScheduledPost } from "@/shared/types";

/**
 * The content calendar.
 *
 * A month grid rather than a list, because "what is going out, and where are
 * the gaps" is a question about a shape, not a sequence — a run of empty
 * Wednesdays is visible here and invisible in a list. Clicking an empty day
 * composes a post for it, which is the action someone takes the moment they see
 * the gap.
 *
 * Repeating posts are drawn on every day they fall on, so the grid shows what
 * the feed will actually receive rather than one row per database record.
 */

const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

type Cell = {
  date: Date;
  key: string;
  inMonth: boolean;
  isToday: boolean;
  isPast: boolean;
};

/** Six weeks from the Monday on or before the 1st — a stable grid all year. */
function monthCells(cursor: Date): Cell[] {
  const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
  // getDay is Sunday-first; the grid is Monday-first, as a working week is.
  const lead = (first.getDay() + 6) % 7;
  const start = new Date(first);
  start.setDate(first.getDate() - lead);

  const todayKey = toDateInput(new Date());
  return Array.from({ length: 42 }, (_, i) => {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    const key = toDateInput(date);
    return {
      date,
      key,
      inMonth: date.getMonth() === cursor.getMonth(),
      isToday: key === todayKey,
      isPast: key < todayKey,
    };
  });
}

/** Whether a repeating post lands on this date. */
function repeatsOn(post: ScheduledPost, date: Date): boolean {
  if (post.frequency === "daily") return true;
  if (post.frequency === "weekly") return date.getDay() === post.weekday;
  return date.getDate() === post.dayOfMonth;
}

function timeLabel(iso: string): string {
  return new Date(iso).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}

function padded(hour: number, minute: number): string {
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

export function PostCalendar({
  posts,
  onOpen,
  onCreateOn,
  viewControl,
}: {
  posts: ScheduledPost[];
  onOpen: (post: ScheduledPost) => void;
  /** Compose a new post already dated to this day. */
  onCreateOn: (date: string) => void;
  /** The calendar/list switch, which lives in this toolbar. */
  viewControl?: React.ReactNode;
}) {
  const [cursor, setCursor] = useState(() => new Date());
  const cells = useMemo(() => monthCells(cursor), [cursor]);

  /** Every post that appears on a given day, in the order it publishes. */
  const byDay = useMemo(() => {
    const map = new Map<string, { post: ScheduledPost; time: string }[]>();
    for (const cell of cells) {
      const entries: { post: ScheduledPost; time: string }[] = [];
      for (const post of posts) {
        if (post.mode === "repeat") {
          // A paused repeat is not going out, so it is not on the calendar.
          if (post.status !== "active") continue;
          if (repeatsOn(post, cell.date)) {
            entries.push({ post, time: padded(post.hour, post.minute) });
          }
          continue;
        }
        // A one-off sits on the day it runs — the day it already ran, once sent.
        const at = post.status === "sent" ? post.lastRunAt : post.nextRunAt;
        if (at && toDateInput(new Date(at)) === cell.key) {
          entries.push({ post, time: timeLabel(at) });
        }
      }
      entries.sort((a, b) => a.time.localeCompare(b.time));
      map.set(cell.key, entries);
    }
    return map;
  }, [cells, posts]);

  const monthLabel = cursor.toLocaleDateString(undefined, { month: "long", year: "numeric" });
  const step = (months: number) =>
    setCursor((c) => new Date(c.getFullYear(), c.getMonth() + months, 1));

  return (
    <Box>
      {/* Month, navigation and the view switch on one line: they are all
          "which posts am I looking at" controls and belong together. */}
      <Group justify="space-between" align="center" mb="sm" wrap="nowrap" gap="sm">
        <Group gap="sm" wrap="nowrap" style={{ minWidth: 0 }}>
          <Text fw={700} size="lg" style={{ whiteSpace: "nowrap" }}>{monthLabel}</Text>
          <Group gap={4} wrap="nowrap">
            <ActionIcon variant="default" size="sm" onClick={() => step(-1)} aria-label="Previous month">
              <ChevronLeft size={15} />
            </ActionIcon>
            <ActionIcon variant="default" size="sm" onClick={() => step(1)} aria-label="Next month">
              <ChevronRight size={15} />
            </ActionIcon>
          </Group>
          <Button
            variant="default"
            size="compact-xs"
            onClick={() => setCursor(new Date())}
            // Nothing to go back to when the current month is already open.
            disabled={
              cursor.getMonth() === new Date().getMonth()
              && cursor.getFullYear() === new Date().getFullYear()
            }
          >
            Today
          </Button>
        </Group>
        {viewControl}
      </Group>

      <Box className="post-calendar">
        {DAY_NAMES.map((d) => (
          <div key={d} className="post-calendar-head">{d}</div>
        ))}

        {cells.map((cell) => {
          const entries = byDay.get(cell.key) ?? [];
          return (
            <Box
              key={cell.key}
              className="post-calendar-day"
              data-outside={!cell.inMonth || undefined}
              data-today={cell.isToday || undefined}
              data-weekend={cell.date.getDay() % 6 === 0 || undefined}
              data-empty={entries.length === 0 || undefined}
            >
              <Group justify="space-between" align="center" wrap="nowrap" mb={4}>
                <Text
                  size="xs"
                  fw={cell.isToday ? 700 : 500}
                  c={cell.inMonth ? undefined : "dimmed"}
                  className={cell.isToday ? "post-calendar-today" : undefined}
                >
                  {cell.date.getDate()}
                </Text>
                {/* Scheduling into the past is not a thing, so those days offer
                    nothing rather than offering an action that would fail. */}
                {!cell.isPast && (
                  <Tooltip label="Schedule a post" withArrow openDelay={400}>
                    <ActionIcon
                      className="post-calendar-add"
                      variant="subtle"
                      color="gray"
                      size="xs"
                      aria-label={`Schedule a post on ${cell.key}`}
                      onClick={() => onCreateOn(cell.key)}
                    >
                      <Plus size={13} />
                    </ActionIcon>
                  </Tooltip>
                )}
              </Group>

              <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                {entries.map(({ post, time }) => (
                  <Box
                    key={`${post.id}-${cell.key}`}
                    component="button"
                    type="button"
                    className="post-calendar-chip"
                    data-sent={post.status === "sent" || undefined}
                    data-failed={post.lastStatus === "failed" || undefined}
                    onClick={() => onOpen(post)}
                    title={post.caption}
                  >
                    {post.mode === "repeat" && <Repeat size={10} style={{ flexShrink: 0 }} />}
                    <span className="post-calendar-time">{time}</span>
                    <span className="post-calendar-name">{post.name}</span>
                  </Box>
                ))}
              </div>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
