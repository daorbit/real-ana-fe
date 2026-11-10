import { WHY_JOURNEY } from "../lib/whyQuantalog";
import { WhySection } from "./WhySection";
import classes from "./Why.module.css";

export function GrowthJourney() {
  return (
    <WhySection
      title="How Quantalog helps you grow"
      lead="Each step hands its data to the next, so you always know which effort brought in which customer."
    >
      <ol className={classes.journey}>
        {WHY_JOURNEY.map((step, index) => (
          <li key={step.key} className={classes.step}>
            <span className={classes.stepNumber}>{index + 1}</span>
            <h3 className={classes.stepTitle}>{step.title}</h3>
            <p className={classes.stepBody}>{step.body}</p>
            <div className={classes.tools}>
              {step.tools.map((tool) => (
                <span key={tool} className={classes.tool}>
                  {tool}
                </span>
              ))}
            </div>
          </li>
        ))}
      </ol>
    </WhySection>
  );
}
