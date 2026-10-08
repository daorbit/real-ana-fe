import { UnstyledButton } from "@mantine/core";
import type { ThemeMode } from "@/shared/lib/theme";
import { ModePreview } from "./ModePreview";
import classes from "./ModePicker.module.css";

const MODES: { id: ThemeMode; label: string }[] = [
  { id: "system", label: "System preference" },
  { id: "light", label: "Light Mode" },
  { id: "dark", label: "Dark Mode" },
];

export function ModePicker({ value, onChange }: { value: ThemeMode; onChange: (mode: ThemeMode) => void }) {
  return (
    <div className={classes.grid} role="radiogroup" aria-label="Interface theme">
      {MODES.map((m) => {
        const selected = value === m.id;
        return (
          <UnstyledButton
            key={m.id}
            className={classes.option}
            role="radio"
            aria-checked={selected}
            data-selected={selected || undefined}
            onClick={() => onChange(m.id)}
          >
            <span className={classes.frame}>
              <ModePreview mode={m.id} />
            </span>
            <span className={classes.caption}>
              <span className={classes.radio} />
              {m.label}
            </span>
          </UnstyledButton>
        );
      })}
    </div>
  );
}
