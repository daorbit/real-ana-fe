import { useState, type ReactNode } from "react";
import { SegmentedControl } from "@mantine/core";
import { ScanSearch } from "lucide-react";
import type { BacklinkOverview, PageCheckResult as Result } from "../types";
import { GapTable } from "./GapTable";
import { PageCheckResult } from "./PageCheckResult";
import { UrlForm } from "./UrlForm";
import classes from "./Backlinks.module.css";

type View = "opportunities" | "shared";

export function LinkGapTab({
  gap,
  hasCompetitors,
  myDomain,
  canEdit,
  checking,
  result,
  onCheck,
  onClearResult,
  notice,
}: {
  gap: BacklinkOverview["gap"];
  hasCompetitors: boolean;
  myDomain: string;
  canEdit: boolean;
  checking: boolean;
  result: Result | null;
  onCheck: (url: string) => Promise<boolean>;
  onClearResult: () => void;
  notice: ReactNode;
}) {
  const [view, setView] = useState<View>("opportunities");
  const stats = [
    { label: "Opportunities", value: gap.opportunities.length, sub: "Link to a competitor, not you" },
    { label: "Shared", value: gap.shared.length, sub: "Link to you and a competitor" },
    { label: "Only you", value: gap.uniqueToYou, sub: "No tracked competitor has these" },
  ];

  return (
    <div className={classes.stack}>
      {canEdit && (
        <section className={classes.card}>
          <div className={classes.cardHead}>
            <div>
              <h3 className={classes.cardTitle}>Check a page</h3>
              <p className={classes.cardSub}>
                Paste any page, such as a roundup, a directory listing or a "best tools" article, to see whether it links to you
                and to each competitor you track. Whatever it finds is added to the profiles and the gap below.
              </p>
            </div>
          </div>
          <UrlForm
            size="md"
            placeholder="https://example.com/best-tools-roundup"
            label="Check this page"
            hint="One request to that page. Public pages only."
            icon={ScanSearch}
            loading={checking}
            onSubmit={onCheck}
          />
          {result && <PageCheckResult result={result} myDomain={myDomain} onClose={onClearResult} />}
        </section>
      )}

      {notice}

      <section className={classes.gapStats}>
        {stats.map((s) => (
          <div key={s.label} className={classes.stat}>
            <span className={classes.statLabel}>{s.label}</span>
            <div className={classes.statValue}>{s.value}</div>
            <div className={classes.statSub}>{s.sub}</div>
          </div>
        ))}
      </section>

      <section className={`${classes.card} ${classes.flush}`}>
        <div className={classes.cardHead}>
          <div>
            <h3 className={classes.cardTitle}>
              {view === "opportunities" ? "Sites linking to competitors, not you" : "Sites linking to you and competitors"}
            </h3>
            <p className={classes.cardSub}>
              {view === "opportunities"
                ? "Sorted by how many of your competitors each site links to. A site that links to several of them has the most reason to link to you."
                : "Sites already in your corner that also back your competitors."}
            </p>
          </div>
          <SegmentedControl
            size="xs"
            radius="md"
            value={view}
            onChange={(v) => setView(v as View)}
            data={[
              { value: "opportunities", label: "Opportunities" },
              { value: "shared", label: "Shared" },
            ]}
          />
        </div>
        <GapTable
          rows={view === "opportunities" ? gap.opportunities : gap.shared}
          emptyText={
            !hasCompetitors
              ? "Track a competitor on the Compare page to see the link gap."
              : view === "opportunities"
                ? "No gaps found yet. Check a few pages above, or import from the index, to fill this in."
                : "No shared linking sites yet."
          }
        />
      </section>
    </div>
  );
}
