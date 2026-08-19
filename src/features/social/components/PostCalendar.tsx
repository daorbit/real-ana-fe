import { useEffect, useMemo, useRef, useState } from "react";
import { ActionIcon, Box, Button, Group, Menu, Text, Tooltip } from "@mantine/core";
import { ChevronDown, ChevronLeft, ChevronRight, Plus, Repeat } from "lucide-react";
import { toDateInput } from "./draft";
import { STAGE_COLOR, stageOf } from "../postStatus";
import type { ScheduledPost } from "@/shared/types";

/**
 * The content calendar.
 *
 * Two shapes for two questions. The week lays hours down the page and days
 * across it, so a post sits at the time it actually publishes — that is the
 * view for "is my Tuesday morning already taken". The month drops the hour
 * axis and answers the coarser one, "where are the empty weeks".
 *
 * Repeating posts are drawn on every day they fall on, so the grid shows what
 * the feed will actually receive rather than one row per database record.
 */

const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/** Height of one hour in the week grid, in pixels. Also the CSS `--hour`. */
const HOUR_PX = 56;

type Scope = "week" | "month";

type Cell = {
  date: Date;
  key: string;
  inMonth: boolean;
  isToday: boolean;
  isPast: boolean;
};

/** An occurrence of a post on a particular day, at a particular minute. */
type Entry = {
  post: ScheduledPost;
  /** Minutes since midnight, which is what places it on the hour grid. */
  minutes: number;
  time: string;
};

function startOfWeek(date: Date): Date {
  const d = new Date(date);
  // getDay is Sunday-first; the grid is Monday-first, as a working week is.
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  d.setHours(0, 0, 0, 0);
  return d;
}

function buildCells(dates: Date[], month: number): Cell[] {
  const todayKey = toDateInput(new Date());
  return dates.map((date) => {
    const key = toDateInput(date);
    return {
      date,
      key,
      inMonth: date.getMonth() === month,
      isToday: key === todayKey,
      isPast: key < todayKey,
    };
  });
}

/** The seven days of the week `cursor` falls in. */
function weekCells(cursor: Date): Cell[] {
  const start = startOfWeek(cursor);
  return buildCells(
    Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    }),
    cursor.getMonth(),
  );
}

/** Six weeks from the Monday on or before the 1st — a stable grid all year. */
function monthCells(cursor: Date): Cell[] {
  const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
  const start = startOfWeek(first);
  return buildCells(
    Array.from({ length: 42 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    }),
    cursor.getMonth(),
  );
}

/** Whether a repeating post lands on this date. */
function repeatsOn(post: ScheduledPost, date: Date): boolean {
  if (post.frequency === "daily") return true;
  if (post.frequency === "weekly") return date.getDay() === post.weekday;
  return date.getDate() === post.dayOfMonth;
}

function clockLabel(hour: number, minute: number): string {
  const d = new Date();
  d.setHours(hour, minute, 0, 0);
  return d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
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
  // The month leads. Someone opening a calendar is asking "what does my month
  // look like" far more often than "is 3pm Tuesday free" — the week answers a
  // question you only have once you already know where the gaps are.
  const [scope, setScope] = useState<Scope>("month");
  const gridRef = useRef<HTMLDivElement | null>(null);

  const cells = useMemo(
    () => (scope === "week" ? weekCells(cursor) : monthCells(cursor)),
    [cursor, scope],
  );

  /** Every occurrence on a given day, in the order it publishes. */
  const byDay = useMemo(() => {
    const map = new Map<string, Entry[]>();
    for (const cell of cells) {
      const entries: Entry[] = [];
      for (const post of posts) {
        if (post.mode === "repeat") {
          // A paused repeat is not going out, so it is not on the calendar.
          if (post.status !== "active") continue;
          if (repeatsOn(post, cell.date)) {
            entries.push({
              post,
              minutes: post.hour * 60 + post.minute,
              time: clockLabel(post.hour, post.minute),
            });
          }
          continue;
        }
        // A one-off sits on the day it runs — the day it already ran, once sent.
        const at = post.status === "sent" ? post.lastRunAt : post.nextRunAt;
        if (at && toDateInput(new Date(at)) === cell.key) {
          const d = new Date(at);
          entries.push({
            post,
            minutes: d.getHours() * 60 + d.getMinutes(),
            time: clockLabel(d.getHours(), d.getMinutes()),
          });
        }
      }
      entries.sort((a, b) => a.minutes - b.minutes);
      map.set(cell.key, entries);
    }
    return map;
  }, [cells, posts]);

  // Open on the working day rather than at midnight: eight empty hours at the
  // top is the first thing someone would otherwise have to scroll past.
  useEffect(() => {
    if (scope !== "week" || !gridRef.current) return;
    const earliest = Math.min(
      ...[...byDay.values()].flat().map((e) => e.minutes),
      8 * 60,
    );
    gridRef.current.scrollTop = Math.max(0, (earliest / 60) * HOUR_PX - HOUR_PX);
  }, [scope, byDay]);

  const label = scope === "week"
    ? (() => {
        const start = cells[0]?.date;
        const end = cells[6]?.date;
        if (!start || !end) return "";
        const sameMonth = start.getMonth() === end.getMonth();
        return sameMonth
          ? start.toLocaleDateString(undefined, { month: "long", year: "numeric" })
          : `${start.toLocaleDateString(undefined, { month: "short" })} – ${end.toLocaleDateString(undefined, { month: "short", year: "numeric" })}`;
      })()
    : cursor.toLocaleDateString(undefined, { month: "long", year: "numeric" });

  const step = (direction: number) =>
    setCursor((c) => {
      const next = new Date(c);
      if (scope === "week") next.setDate(c.getDate() + direction * 7);
      else next.setMonth(c.getMonth() + direction, 1);
      return next;
    });

  const showingNow = scope === "week"
    ? startOfWeek(cursor).getTime() === startOfWeek(new Date()).getTime()
    : cursor.getMonth() === new Date().getMonth()
      && cursor.getFullYear() === new Date().getFullYear();

  return (
    <Box>
      {/* Navigation, scope and the view switch on one line: they are all "which
          posts am I looking at" controls and belong together. */}
      <Group justify="space-between" align="center" mb="sm" wrap="wrap" gap="sm">
        <Group gap="xs" wrap="nowrap" style={{ minWidth: 0 }}>
          {/* Stepping arrows sit flush against each other and ahead of the
              label they move, so the period reads as the thing being paged. */}
          <Group gap={2} wrap="nowrap">
            <ActionIcon variant="subtle" color="gray" size="md" onClick={() => step(-1)} aria-label="Previous">
              <ChevronLeft size={17} />
            </ActionIcon>
            <ActionIcon variant="subtle" color="gray" size="md" onClick={() => step(1)} aria-label="Next">
              <ChevronRight size={17} />
            </ActionIcon>
          </Group>

          <Text fw={700} size="lg" style={{ whiteSpace: "nowrap" }}>{label}</Text>

          <Button
            variant="default"
            size="compact-sm"
            onClick={() => setCursor(new Date())}
            // Nothing to go back to when the current period is already open.
            disabled={showingNow}
          >
            Today
          </Button>

          {/* A menu rather than a segmented pair: there are only two scopes
              today, but the control names the one you are in rather than
              showing both at equal weight, which is what a calendar's period
              picker does everywhere else people have used one. */}
          <Menu position="bottom-start" withArrow radius="md" width={140}>
            <Menu.Target>
              <Button
                variant="default"
                size="compact-sm"
                rightSection={<ChevronDown size={13} />}
              >
                {scope === "week" ? "Week" : "Month"}
              </Button>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item onClick={() => setScope("month")}>Month</Menu.Item>
              <Menu.Item onClick={() => setScope("week")}>Week</Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>

        {viewControl}
      </Group>

      {scope === "week" ? (
        <WeekGrid
          cells={cells}
          byDay={byDay}
          gridRef={gridRef}
          onOpen={onOpen}
          onCreateOn={onCreateOn}
        />
      ) : (
        <MonthGrid cells={cells} byDay={byDay} onOpen={onOpen} onCreateOn={onCreateOn} />
      )}
    </Box>
  );
}

/**
 * Days across, hours down, each post at the time it publishes.
 *
 * Absolute placement against a fixed hour height rather than a row per post:
 * two posts an hour apart should look an hour apart, which is the whole reason
 * to draw a time axis at all.
 */
function WeekGrid({
  cells,
  byDay,
  gridRef,
  onOpen,
  onCreateOn,
}: {
  cells: Cell[];
  byDay: Map<string, Entry[]>;
  gridRef: React.RefObject<HTMLDivElement | null>;
  onOpen: (post: ScheduledPost) => void;
  onCreateOn: (date: string) => void;
}) {
  const hours = Array.from({ length: 24 }, (_, h) => h);
  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  return (
    <Box className="cal-week" style={{ ["--hour" as string]: `${HOUR_PX}px` }}>
      {/* The day names stay put while the hours scroll under them. */}
      <Box className="cal-week__head">
        <div className="cal-week__gutter-head" />
        {cells.map((cell) => (
          <div key={cell.key} className="cal-week__day-head" data-today={cell.isToday || undefined}>
            <Text size="xs" c={cell.isToday ? undefined : "dimmed"} fw={500}>
              {DAY_NAMES[(cell.date.getDay() + 6) % 7]}
            </Text>
            <Text size="lg" fw={cell.isToday ? 700 : 500} lh={1.2}>
              {cell.date.getDate()}
            </Text>
          </div>
        ))}
      </Box>

      <Box className="cal-week__body" ref={gridRef}>
        <Box className="cal-week__grid">
          {/* Hour labels sit in their own column, on the line they name. */}
          <div className="cal-week__gutter">
            {hours.map((h) => (
              <div key={h} className="cal-week__hour-label">
                {h > 0 && <span>{clockLabel(h, 0)}</span>}
              </div>
            ))}
          </div>

          {cells.map((cell) => {
            const entries = byDay.get(cell.key) ?? [];
            return (
              <div
                key={cell.key}
                className="cal-week__col"
                data-today={cell.isToday || undefined}
                data-past={cell.isPast || undefined}
              >
                {hours.map((h) => (
                  <div
                    key={h}
                    className="cal-week__slot"
                    // Clicking an empty hour composes a post for it, which is
                    // the action someone takes the moment they see the gap.
                    onClick={() => !cell.isPast && onCreateOn(cell.key)}
                    role={cell.isPast ? undefined : "button"}
                    aria-label={cell.isPast ? undefined : `Schedule a post on ${cell.key}`}
                  >
                    {!cell.isPast && <Plus size={13} className="cal-week__slot-add" />}
                  </div>
                ))}

                {/* The current time, drawn across today only. */}
                {cell.isToday && (
                  <div
                    className="cal-week__now"
                    style={{ top: `calc(${nowMinutes} / 60 * var(--hour))` }}
                    aria-hidden
                  />
                )}

                {entries.map(({ post, minutes, time }) => (
                  <button
                    key={`${post.id}-${cell.key}`}
                    type="button"
                    className="cal-week__post"
                    style={{ top: `calc(${minutes} / 60 * var(--hour))` }}
                    data-tone={STAGE_COLOR[stageOf(post)]}
                    onClick={() => onOpen(post)}
                    title={post.caption}
                  >
                    <span className="cal-week__post-time">
                      {post.mode === "repeat" && <Repeat size={9} />}
                      {time}
                    </span>
                    <span className="cal-week__post-name">{post.name}</span>
                  </button>
                ))}
              </div>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
}

/** The coarser view: whole weeks, no hour axis. */
function MonthGrid({
  cells,
  byDay,
  onOpen,
  onCreateOn,
}: {
  cells: Cell[];
  byDay: Map<string, Entry[]>;
  onOpen: (post: ScheduledPost) => void;
  onCreateOn: (date: string) => void;
}) {
  return (
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
                  nothing rather than an action that would fail. */}
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

            <div className="post-calendar-stack">
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
  );
}
