import { Button } from "@mantine/core";
import { CalendarIcon } from "lucide-react";
import classes from "./Why.module.css";

export function WhyCta({ onBookDemo }: { onBookDemo: () => void }) {
  return (
    <div className={classes.cta}>
      <div>
        <h2 className={classes.ctaTitle}>Want a walkthrough for your business?</h2>
        <p className={classes.ctaBody}>
          Book a free 1:1 call and we will set up Quantalog around how you find, win and keep customers.
        </p>
      </div>
      <Button radius={10} leftSection={<CalendarIcon size={16} />} onClick={onBookDemo}>
        Book a demo call
      </Button>
    </div>
  );
}
