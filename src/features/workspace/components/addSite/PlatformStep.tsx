import { Box, UnstyledButton } from "@mantine/core";
import { Check } from "lucide-react";
import { PLATFORM_CHOICES, type Platform } from "./constants";
import classes from "./AddSiteWizard.module.css";

export function PlatformStep({ value, onChange }: { value: Platform; onChange: (p: Platform) => void }) {
  return (
    <Box className={classes.choices} role="radiogroup" aria-label="Platform">
      {PLATFORM_CHOICES.map((choice) => {
        const selected = value === choice.id;
        return (
          <UnstyledButton
            key={choice.id}
            className={classes.choice}
            data-selected={selected || undefined}
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(choice.id)}
          >
            <span className={classes.choiceTop}>
              <choice.icon size={20} strokeWidth={1.75} />
              <span className={classes.radio} aria-hidden />
            </span>
            <span className={classes.choiceTitle}>{choice.title}</span>
            <span className={classes.choiceBlurb}>{choice.blurb}</span>
            <ul className={classes.points}>
              {choice.points.map((point) => (
                <li key={point} className={classes.point}>
                  <Check size={13} className={classes.pointIcon} />
                  {point}
                </li>
              ))}
            </ul>
          </UnstyledButton>
        );
      })}
    </Box>
  );
}
