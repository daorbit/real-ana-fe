import { LEVEL_LABEL } from "../lib/labels";
import { PRIORITY_HELP } from "../lib/help";
import type { Level, OpportunityCard } from "../types";
import { OpportunityGroup } from "./OpportunityRow";
import { SectionHeader } from "./SectionHeader";
import classes from "./GrowthRadar.module.css";

const LEVELS: Level[] = ["high", "medium", "low"];

export function PriorityGroups({ cards }: { cards: OpportunityCard[] }) {
  return (
    <>
      {LEVELS.map((level) => {
        const group = cards.filter((c) => c.priority === level);
        if (!group.length) return null;
        return (
          <section key={level} className={classes.section}>
            <SectionHeader title={`${LEVEL_LABEL[level]} priority`} count={group.length} help={PRIORITY_HELP[level]} />
            <OpportunityGroup cards={group} />
          </section>
        );
      })}
    </>
  );
}
