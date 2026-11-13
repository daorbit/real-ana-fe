import { Database, Radar, TrendingUp } from "lucide-react";
import { SectionHeader } from "./SectionHeader";
import classes from "./GrowthRadar.module.css";

const STEPS = [
  {
    icon: Database,
    title: "Reads your data",
    text: "Every morning it looks at your analytics, forms, bookings and Google Search data, if they are connected.",
  },
  {
    icon: Radar,
    title: "Finds what changed",
    text: "Five checks compare recent periods with earlier ones and list only changes big enough to trust, with the numbers.",
  },
  {
    icon: TrendingUp,
    title: "You act, it measures",
    text: "Plan a fix, give it an owner, record what you changed, and see the same number again afterwards.",
  },
];

export function HowItWorks() {
  return (
    <section className={classes.section}>
      <SectionHeader title="How Growth Radar works" />
      <div className={classes.steps}>
        {STEPS.map(({ icon: Icon, title, text }) => (
          <div key={title} className={classes.step}>
            <Icon size={20} className={classes.stepIcon} aria-hidden />
            <span className={classes.stepTitle}>{title}</span>
            <span className={classes.stepText}>{text}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
