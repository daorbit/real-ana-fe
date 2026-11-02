import { UnstyledButton } from "@mantine/core";
import { ChevronLeft, ChevronRight } from "lucide-react";
import classes from "./PeriodNav.module.css";

export function PeriodNav({
  previousLabel,
  nextLabel,
  onPrevious,
  onToday,
  onNext,
}: {
  previousLabel: string;
  nextLabel: string;
  onPrevious: () => void;
  onToday: () => void;
  onNext: () => void;
}) {
  return (
    <span className={classes.nav}>
      <UnstyledButton className={classes.step} onClick={onPrevious} aria-label={previousLabel}>
        <ChevronLeft size={16} />
      </UnstyledButton>
      <UnstyledButton className={classes.today} onClick={onToday}>
        Today
      </UnstyledButton>
      <UnstyledButton className={classes.step} onClick={onNext} aria-label={nextLabel}>
        <ChevronRight size={16} />
      </UnstyledButton>
    </span>
  );
}
