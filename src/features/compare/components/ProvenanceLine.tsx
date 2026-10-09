import { Tooltip } from "@mantine/core";
import { BadgeCheck, History } from "lucide-react";
import { dateTime } from "@/shared/lib";
import type { SeoCompareBaseline, SeoCompetitorComparison } from "@/shared/types";
import { measuredTogether } from "../lib/trust";
import classes from "./Compare.module.css";

const METHOD =
  "Both pages are fetched by the same Quantalog crawler, parsed by the same code and scored by the same on-page formula: titles, headings, content, structure, schema and server response. It does not include Lighthouse, backlinks or rankings, so it differs from your SEO report score. Response time is a single sample from our server and varies with network conditions.";

export function ProvenanceLine({
  baseline,
  comparison,
}: {
  baseline: SeoCompareBaseline;
  comparison: SeoCompetitorComparison;
}) {
  const together = measuredTogether(baseline, comparison);
  const theirs = comparison.lastCheckedAt ? dateTime(comparison.lastCheckedAt) : "not yet";
  const yours = baseline.checkedAt ? dateTime(baseline.checkedAt) : "unknown";

  return (
    <Tooltip label={METHOD} withArrow multiline w={320} position="bottom-start">
      <p className={classes.provenance} data-together={together || undefined}>
        {together ? <BadgeCheck size={13} /> : <History size={13} />}
        {together
          ? `Both pages measured together · ${theirs} · same crawler, parser and formula`
          : `Yours ${baseline.source === "audit" ? "from your audit" : "measured"} ${yours} · theirs ${theirs}`}
      </p>
    </Tooltip>
  );
}
