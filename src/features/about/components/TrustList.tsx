import { ShieldCheckIcon } from "lucide-react";
import { WHY_TRUST } from "../lib/whyQuantalog";
import { WhySection } from "./WhySection";
import classes from "./Why.module.css";

export function TrustList() {
  return (
    <WhySection title="Built to be trusted" lead="Your visitors, your team and your data are treated with care from day one.">
      <div className={classes.trust}>
        {WHY_TRUST.map((point) => (
          <div key={point.title} className={classes.trustItem}>
            <ShieldCheckIcon size={18} className={classes.trustIcon} />
            <div>
              <h3 className={classes.honestTitle}>{point.title}</h3>
              <p className={classes.honestBody}>{point.body}</p>
            </div>
          </div>
        ))}
      </div>
    </WhySection>
  );
}
