import { Link } from "react-router-dom";
import { Button } from "@mantine/core";
import { BookOpen, Info } from "lucide-react";
import { RankCard } from "@/shared/ui/rank/RankCard";
import classes from "./Conversion.module.css";

const STEPS = [
  {
    title: "Send an event",
    body: "Fire a signup, a purchase or a plan upgrade from your own site with one line of code.",
  },
  {
    title: "Read the conversion rate",
    body: "The share of visitors in this period who fired the event at least once.",
  },
  {
    title: "Attach a value",
    body: "Pass a numeric value in the event props and it is summed into revenue per event and overall.",
  },
];

export function EventsGuideCard() {
  return (
    <RankCard title="About events" icon={Info} tone="violet">
      <ol className={classes.steps}>
        {STEPS.map((step, i) => (
          <li key={step.title} className={classes.step}>
            <span className={classes.stepNum}>{i + 1}</span>
            <span className={classes.stepText}>
              <span className={classes.stepTitle}>{step.title}</span>
              <span className={classes.stepBody}>{step.body}</span>
            </span>
          </li>
        ))}
      </ol>
      <code className={classes.snippet}>{`rta.track("purchase", { value: 49 });`}</code>
      <Button
        component={Link}
        to="/app/developers"
        variant="default"
        size="xs"
        radius="md"
        className={classes.guideAction}
        leftSection={<BookOpen size={14} />}
      >
        See the tracking docs
      </Button>
    </RankCard>
  );
}
