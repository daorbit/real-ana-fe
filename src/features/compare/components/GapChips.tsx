import { Tooltip } from "@mantine/core";
import { Info } from "lucide-react";
import type { SeoCompetitorGap } from "@/shared/types";
import classes from "./Compare.module.css";

const GROUPS: { key: "contentGaps" | "missingSchemaTypes" | "missingKeywords"; title: string; hint: string }[] = [
  {
    key: "contentGaps",
    title: "Sections they cover",
    hint: "Headings on their page with no counterpart on yours. Each is a question a visitor asked that your page does not answer.",
  },
  {
    key: "missingSchemaTypes",
    title: "Schema they declare",
    hint: "Structured data types they mark up. This earns rich results and makes a page quotable by AI answer engines.",
  },
  {
    key: "missingKeywords",
    title: "Prominent terms",
    hint: "Words used often on their page and not at all on yours. A prompt for what to write about — not a checklist to stuff in.",
  },
];

export function GapChips({ gap }: { gap: SeoCompetitorGap }) {
  const groups = GROUPS.filter((g) => gap[g.key].length > 0);
  if (!groups.length) return null;

  return (
    <section className={classes.card}>
      <div className={classes.cardHead}>
        <div>
          <h3 className={classes.cardTitle}>What they have that you do not</h3>
          <p className={classes.cardSub}>Found on their page and missing from yours.</p>
        </div>
      </div>
      <div className={classes.gapGroups}>
        {groups.map((g) => (
          <div key={g.key}>
            <Tooltip label={g.hint} withArrow multiline w={280} position="top-start">
              <span className={classes.gapLabel}>
                {g.title}
                <Info size={12} className={classes.infoIcon} />
              </span>
            </Tooltip>
            <div className={classes.chips}>
              {gap[g.key].map((item) => (
                <span key={item} className={classes.chip}>
                  {item}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
