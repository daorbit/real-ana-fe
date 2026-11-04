import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { CheckCircle2, Inbox } from "lucide-react";
import { DELIVERY_WINDOW_MINUTES } from "./draft";
import { OpenSlots } from "./OpenSlots";
import { PostRow } from "./PostRow";
import { usePostFilters } from "../hooks/usePostFilters";
import { dayLabel, freeSlots } from "../postTime";
import { EmptyState } from "@/shared/ui/EmptyState";
import type { ScheduledPost } from "@/shared/types";
import classes from "./SocialQueue.module.css";

const HORIZON_STEP = 14;

export function PostQueue({
  author,
  instagramAuthor,
  onEdit,
  onToggle,
  onDelete,
  onPublish,
  onCreate,
  publishingId,
  recentlyMovedId,
  filters,
}: {
  author: string;
  instagramAuthor?: string;
  onEdit: (post: ScheduledPost) => void;
  onToggle: (post: ScheduledPost) => void;
  onDelete: (post: ScheduledPost) => void;
  onPublish: (post: ScheduledPost) => void;
  onCreate?: (at: string) => void;
  publishingId: string | null;
  recentlyMovedId?: string | null;
  filters: ReturnType<typeof usePostFilters>;
}) {
  const handlers = { onEdit, onToggle, onDelete, onPublish, publishingId, recentlyMovedId };
  const authorFor = (post: ScheduledPost) => (post.provider === "instagram" ? instagramAuthor ?? "" : author);
  const { filter, visible } = filters;

  const upcoming = useMemo(
    () =>
      visible
        .filter((p) => p.mode !== "repeat")
        .sort((a, b) => +new Date(a.nextRunAt) - +new Date(b.nextRunAt)),
    [visible],
  );
  const repeating = visible.filter((p) => p.mode === "repeat");
  const [horizon, setHorizon] = useState(HORIZON_STEP);

  const days = useMemo(() => {
    const byDay = new Map<string, ScheduledPost[]>();
    for (const post of upcoming) {
      const key = new Date(post.nextRunAt).toDateString();
      byDay.set(key, [...(byDay.get(key) ?? []), post]);
    }

    const out: { label: string; posts: ScheduledPost[]; date: string }[] = [];
    const cursor = new Date();
    cursor.setHours(0, 0, 0, 0);

    for (let i = 0; i < horizon; i++) {
      const key = cursor.toDateString();
      const iso = cursor.toISOString();
      out.push({ label: dayLabel(iso), posts: byDay.get(key) ?? [], date: iso });
      byDay.delete(key);
      cursor.setDate(cursor.getDate() + 1);
    }

    for (const [key, dayPosts] of byDay) {
      const iso = new Date(key).toISOString();
      out.push({ label: dayLabel(iso), posts: dayPosts, date: iso });
    }

    return out.sort((a, b) => +new Date(a.date) - +new Date(b.date));
  }, [upcoming, horizon]);

  const canExtend = horizon < 365;
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !canExtend) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setHorizon((d) => d + HORIZON_STEP);
      },
      { root: el.closest(".app-panel__scroll"), rootMargin: "600px 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [canExtend, horizon]);

  if (visible.length === 0 && filter !== "queue") {
    return filter === "failed" ? (
      <EmptyState
        icon={CheckCircle2}
        title="Nothing has failed"
        description="Every post has gone out as scheduled. Any that don't will appear here with the reason."
      />
    ) : (
      <EmptyState
        icon={Inbox}
        title="No posts here"
        description="Nothing on this shelf yet. Pick another tab to see the rest of your posts."
      />
    );
  }

  return (
    <div className={classes.queue}>
      {days.map((day) => {
        const slots = filter === "queue" ? freeSlots(day.date, day.posts) : [];
        if (day.posts.length === 0 && slots.length === 0) return null;

        return (
          <Day key={day.date} title={day.label}>
            {day.posts.map((post) => (
              <PostRow key={post.id} post={post} author={authorFor(post)} {...handlers} />
            ))}
            {slots.length > 0 && (
              <OpenSlots slots={slots} disabled={!onCreate} onCreate={(at) => onCreate?.(at)} />
            )}
          </Day>
        );
      })}

      {filter === "queue" && canExtend && (
        <div ref={sentinelRef} className="post-timeline-sentinel" aria-hidden />
      )}

      {repeating.length > 0 && (
        <Day title="Repeating">
          {repeating.map((post) => (
            <PostRow key={post.id} post={post} author={authorFor(post)} {...handlers} />
          ))}
        </Day>
      )}

      <p className={classes.note}>
        Scheduled posts publish within {DELIVERY_WINDOW_MINUTES} minutes of their time, never before it.
      </p>
    </div>
  );
}

function Day({ title, children }: { title: string; children: ReactNode }) {
  const [lead, ...rest] = title.split(", ");

  return (
    <section className={classes.day}>
      <h2 className={classes.dayTitle}>
        {lead}
        {rest.length > 0 && <span className={classes.dayDate}>{rest.join(", ")}</span>}
      </h2>
      <div className={classes.card}>{children}</div>
    </section>
  );
}
