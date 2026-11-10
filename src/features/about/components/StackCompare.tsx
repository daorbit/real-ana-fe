import { Anchor } from "@mantine/core";
import { CheckIcon, ScaleIcon } from "lucide-react";
import { SITE_URL } from "@/shared/lib/docsSlugs";
import { WHY_HONEST, WHY_STACK, WHY_STACK_NOTE } from "../lib/whyQuantalog";
import { WhySection } from "./WhySection";
import classes from "./Why.module.css";

export function StackCompare() {
  return (
    <WhySection
      title="One workspace instead of a stack of tools"
      lead="Most teams pay for, log into and copy data between separate apps. Here is what Quantalog covers on its own."
    >
      <div className={classes.compare}>
        <div className={classes.compareRow} data-head>
          <span>What you need</span>
          <span>Quantalog</span>
          <span>Without it</span>
        </div>
        {WHY_STACK.map((row) => (
          <div key={row.need} className={classes.compareRow}>
            <span className={classes.need}>{row.need}</span>
            <span className={classes.ours}>
              <CheckIcon size={15} className={classes.oursCheck} />
              {row.quantalog}
            </span>
            <span className={classes.theirs}>{row.elsewhere}</span>
          </div>
        ))}
        <p className={classes.compareNote}>
          {WHY_STACK_NOTE}{" "}
          <Anchor href={`${SITE_URL}/compare`} target="_blank" rel="noreferrer" size="sm">
            See detailed comparisons
          </Anchor>
        </p>
      </div>

      {WHY_HONEST.map((point) => (
        <div key={point.title} className={classes.honest}>
          <ScaleIcon size={18} className={classes.honestIcon} />
          <div>
            <h3 className={classes.honestTitle}>{point.title}</h3>
            <p className={classes.honestBody}>{point.body}</p>
          </div>
        </div>
      ))}
    </WhySection>
  );
}
