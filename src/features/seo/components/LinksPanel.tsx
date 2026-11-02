import { useState } from "react";
import { Anchor, Tooltip } from "@mantine/core";
import { Link2 } from "lucide-react";
import type { SeoLinkCheck, SeoLinkResult, SeoLinkStatus } from "@/shared/types";
import { EmptyState } from "@/shared/ui/EmptyState";
import { Pill } from "@/features/seo/components/shared/Pill";
import { ListEmpty, ListHead, SeoList } from "@/features/seo/components/shared/SeoList";
import { Tile, Tiles } from "@/features/seo/components/shared/Tile";
import type { Tone } from "@/features/seo/components/shared/tone";
import sharedClasses from "@/features/seo/components/shared/seoUi.module.css";
import classes from "@/features/seo/components/panels/site/site.module.css";

const STATUS: Record<SeoLinkStatus, { label: string; tone: Tone; explain: string }> = {
  ok: { label: "OK", tone: "good", explain: "Responded normally." },
  broken: { label: "Broken", tone: "bad", explain: "The target does not exist. Visitors following this link hit a dead end." },
  "server-error": { label: "Server error", tone: "bad", explain: "The target server failed. This may be temporary." },
  redirect: { label: "Redirect", tone: "warn", explain: "Resolves, but only after a detour. Each hop costs crawl budget." },
  timeout: { label: "Timeout", tone: "warn", explain: "No response in time. The target may be slow rather than broken." },
  blocked: { label: "Blocked", tone: "neutral", explain: "Not checked, because the address is not publicly reachable." },
  skipped: { label: "Skipped", tone: "neutral", explain: "Over the per-audit link limit." },
};

type Filter = "problems" | "all" | SeoLinkStatus;

const FILTER_LABEL: Partial<Record<Filter, string>> = {
  ok: "Working",
  broken: "Broken",
  redirect: "Redirects",
  "server-error": "Errors",
};

function isProblem(r: SeoLinkResult): boolean {
  return r.status !== "ok" && r.status !== "skipped" && r.status !== "blocked";
}

export function LinksPanel({ links }: { links?: SeoLinkCheck }) {
  const [filter, setFilter] = useState<Filter>("problems");

  if (!links) {
    return (
      <EmptyState
        compact
        icon={Link2}
        title="Not checked on this report"
        description="This audit ran before link checking was added. Run it again to test every link on the page."
      />
    );
  }

  const problems = links.results.filter(isProblem);
  const healthy = links.results.filter((r) => r.status === "ok").length;
  const errors = links.serverErrors + links.timeouts;
  const shown =
    filter === "all"
      ? links.results
      : filter === "problems"
        ? problems
        : filter === "server-error"
          ? links.results.filter((r) => r.status === "server-error" || r.status === "timeout")
          : links.results.filter((r) => r.status === filter);
  const internalBroken = links.results.some((r) => r.status === "broken" && r.internal);
  const tabs: { id: Filter; label: string }[] = [
    { id: "problems", label: `Problems ${problems.length}` },
    { id: "all", label: `All ${links.results.length}` },
    ...(FILTER_LABEL[filter] ? [{ id: filter, label: FILTER_LABEL[filter] as string }] : []),
  ];

  return (
    <div className={classes.stack}>
      <Tiles>
        <Tile label="Working" value={String(healthy)} tone={healthy ? "good" : undefined} onClick={() => setFilter("ok")} />
        <Tile label="Redirects" value={String(links.redirects)} tone={links.redirects ? "warn" : undefined} onClick={() => setFilter("redirect")} />
        <Tile label="Broken" value={String(links.broken)} tone={links.broken ? "bad" : undefined} onClick={() => setFilter("broken")} />
        <Tile label="Errors / timeouts" value={String(errors)} tone={errors ? "warn" : undefined} onClick={() => setFilter("server-error")} />
      </Tiles>

      <SeoList>
        <div className={classes.toolbar}>
          <div className="seo-segment" role="group" aria-label="Show links">
            {tabs.map((t) => (
              <button
                key={t.id}
                type="button"
                data-active={filter === t.id || undefined}
                aria-pressed={filter === t.id}
                onClick={() => setFilter(t.id)}
              >
                {t.label}
              </button>
            ))}
          </div>
          <span className={sharedClasses.rowMeta}>{links.checked} checked</span>
        </div>
        {internalBroken && (
          <p className={classes.note} data-tone="bad">
            Some broken links point at your own site. Those are fully in your control, so fix them first.
          </p>
        )}
        {links.skipped > 0 && (
          <p className={classes.note}>
            {links.skipped} link{links.skipped === 1 ? " was" : "s were"} not checked. One audit tests at most 100, internal links first.
          </p>
        )}
        <ListHead>
          <span className={classes.colGrow}>Link</span>
          <span className={classes.colAnchor}>Anchor text</span>
          <span className={classes.colScope}>Scope</span>
          <span className={classes.colStatus}>Status</span>
        </ListHead>
        {shown.length ? (
          shown.map((r, i) => <LinkRow key={`${r.url}-${i}`} result={r} />)
        ) : (
          <ListEmpty>{filter === "problems" ? "Every link works." : "Nothing in this view."}</ListEmpty>
        )}
      </SeoList>
    </div>
  );
}

function LinkRow({ result }: { result: SeoLinkResult }) {
  const s = STATUS[result.status];
  return (
    <div className={sharedClasses.row}>
      <span className={classes.colGrow}>
        <Anchor
          href={result.url}
          target="_blank"
          rel="noopener noreferrer"
          className={`${classes.truncate} ${sharedClasses.mono}`}
        >
          {result.url}
        </Anchor>
        {result.chain.length > 1 && <span className={classes.chain}>→ {result.chain[result.chain.length - 1]}</span>}
      </span>
      <span className={`${classes.colAnchor} ${classes.truncate} ${sharedClasses.rowText}`} title={result.text}>
        {result.text || "—"}
      </span>
      <span className={`${classes.colScope} ${sharedClasses.rowMeta}`}>{result.internal ? "Internal" : "External"}</span>
      <span className={classes.colStatus}>
        <Tooltip label={result.note ?? s.explain} withArrow multiline w={260}>
          <span>
            <Pill tone={s.tone}>
              {result.statusCode ? `${result.statusCode} ${s.label}` : s.label}
            </Pill>
          </span>
        </Tooltip>
      </span>
    </div>
  );
}
