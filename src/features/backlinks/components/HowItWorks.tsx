import { Fragment } from "react";
import { Badge } from "@mantine/core";
import { ArrowRight, Activity, FileSearch, ShieldCheck, RefreshCw, GitCompareArrows } from "lucide-react";
import { BACKLINKS_HELP } from "./help";
import classes from "./Backlinks.module.css";

const FLOW = [
  { label: "Visitors arrive", icon: Activity },
  { label: "Referring pages found", icon: FileSearch },
  { label: "Each page fetched and read", icon: ShieldCheck },
  { label: "Re-checked weekly", icon: RefreshCw },
  { label: "Compared with competitors", icon: GitCompareArrows },
];

export function HowItWorks() {
  return (
    <div className={classes.stack}>
      <section className={classes.card}>
        <div className={classes.cardHead}>
          <div>
            <h3 className={classes.cardTitle}>From a visit to a tracked backlink</h3>
            <p className={classes.cardSub}>
              Your tracker already records where visitors come from. Backlinks turns those referrers into verified links,
              keeps watching them, and lines them up against your competitors.
            </p>
          </div>
        </div>
        <div className={classes.flow}>
          {FLOW.map((f, i) => (
            <Fragment key={f.label}>
              {i > 0 && <ArrowRight size={14} className={classes.flowArrow} />}
              <span className={classes.flowStep}>
                <f.icon size={14} />
                {f.label}
              </span>
            </Fragment>
          ))}
        </div>
      </section>

      <div className={classes.steps}>
        {BACKLINKS_HELP.map((section, i) => (
          <section key={section.id} className={`${classes.card} ${classes.step}`}>
            <div className={classes.stepHead}>
              <span className={classes.stepIcon}>
                <section.icon size={17} />
              </span>
              <div>
                <div className={classes.stepNum}>Step {i + 1}</div>
                <h3 className={classes.cardTitle}>{section.label}</h3>
              </div>
            </div>
            <p className={classes.stepBlurb}>{section.blurb}</p>
            <div className={classes.stepItems}>
              {section.items.map((item) => (
                <div key={item.term} className={classes.stepItem}>
                  <div className={classes.stepTerm}>
                    {item.term}
                    {item.tag && (
                      <Badge size="xs" variant="light" color="gray" radius="sm">
                        {item.tag}
                      </Badge>
                    )}
                  </div>
                  <p className={classes.stepDetail}>{item.detail}</p>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
