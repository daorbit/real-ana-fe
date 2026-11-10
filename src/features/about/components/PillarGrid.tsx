import { CheckIcon } from "lucide-react";
import { WHY_PILLARS } from "../lib/whyQuantalog";
import { WhySection } from "./WhySection";
import classes from "./Why.module.css";

export function PillarGrid() {
  return (
    <WhySection
      title="Everything a growing business runs on"
      lead="Six jobs most teams cover with a different tool each. In Quantalog they share the same data, so a visit, a lead and an invoice are one story."
    >
      <div className={classes.pillars}>
        {WHY_PILLARS.map(({ key, icon: Icon, tone, title, body, features }) => (
          <article key={key} className={classes.pillar} data-tone={tone}>
            <span className={classes.pillarIcon}>
              <Icon size={20} />
            </span>
            <h3 className={classes.pillarTitle}>{title}</h3>
            <p className={classes.pillarBody}>{body}</p>
            <ul className={classes.featureList}>
              {features.map((feature) => (
                <li key={feature} className={classes.feature}>
                  <CheckIcon size={14} className={classes.featureCheck} />
                  {feature}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </WhySection>
  );
}
