import { ActionIcon } from "@mantine/core";
import { ArrowDownRight, ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
import { OrbitMark } from "@/features/orbit/components/OrbitMark";
import { TONE_LABEL, weekLabel } from "../lib/insight";
import type { InsightDigest, InsightTone } from "../types";
import classes from "./Insights.module.css";

const QUIET = "A quiet week. Nothing moved enough to call out, and traffic held steady against the week before.";
const TONES: InsightTone[] = ["good", "bad", "info"];

export function WeeklySummary({
  digest,
  onOlder,
  onNewer,
}: {
  digest: InsightDigest;
  onOlder: (() => void) | null;
  onNewer: (() => void) | null;
}) {
  const change =
    digest.previousVisitors > 0
      ? Math.round(((digest.visitors - digest.previousVisitors) / digest.previousVisitors) * 100)
      : null;
  const dir = change === null || change === 0 ? "flat" : change > 0 ? "up" : "down";
  const read = digest.insights.length ? digest.summary : QUIET;

  return (
    <section className={classes.summary}>
      <div className={classes.summaryTop}>
        <div>
          <div className={classes.stepper}>
            <ActionIcon variant="subtle" color="gray" radius="xl" disabled={!onOlder} onClick={onOlder ?? undefined} aria-label="Previous week">
              <ChevronLeft size={18} />
            </ActionIcon>
            <span className={classes.stepperLabel}>{weekLabel(digest.periodStart, digest.periodEnd)}</span>
            <ActionIcon variant="subtle" color="gray" radius="xl" disabled={!onNewer} onClick={onNewer ?? undefined} aria-label="Next week">
              <ChevronRight size={18} />
            </ActionIcon>
          </div>
          <span className={classes.eyebrow}>Visitors</span>
          <div className={classes.bigNumber}>
            <span className={classes.bigValue}>{digest.visitors.toLocaleString()}</span>
            <span className={classes.bigUnit}>this week</span>
          </div>
          <span className={classes.trend} data-dir={dir}>
            {dir === "up" && <ArrowUpRight size={16} strokeWidth={2.4} />}
            {dir === "down" && <ArrowDownRight size={16} strokeWidth={2.4} />}
            {change === null ? "No earlier week to compare" : `${Math.abs(change)}% from last week`}
          </span>
        </div>
        {digest.insights.length > 0 && (
          <div className={classes.tally}>
            {TONES.map((tone) => (
              <span key={tone} className={classes.tallyItem}>
                <span className={classes.tallyValue}>{digest.insights.filter((i) => i.tone === tone).length}</span>
                <span className={classes.tallyLabel}>{TONE_LABEL[tone]}</span>
              </span>
            ))}
          </div>
        )}
      </div>
      {read && (
        <div className={classes.read}>
          <span className={classes.readMark}>
            <OrbitMark size={22} />
          </span>
          <div className={classes.readText}>
            <span className={classes.readTitle}>Orbit's read on the week</span>
            <p className={classes.readBody}>{read}</p>
          </div>
        </div>
      )}
    </section>
  );
}
