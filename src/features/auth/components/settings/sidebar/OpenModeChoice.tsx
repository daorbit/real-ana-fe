import { UnstyledButton } from "@mantine/core";
import { AppWindow, ExternalLink } from "lucide-react";
import type { CustomLinkMode } from "@/app/shell/navPrefs";
import classes from "./Sidebar.module.css";

const OPTIONS: { id: CustomLinkMode; title: string; hint: string; icon: typeof AppWindow }[] = [
  { id: "internal", title: "Inside Quantalog", hint: "Opens on its own page, with the sidebar", icon: AppWindow },
  { id: "external", title: "In a new tab", hint: "Leaves Quantalog open behind it", icon: ExternalLink },
];

export function OpenModeChoice({ value, onChange }: { value: CustomLinkMode; onChange: (mode: CustomLinkMode) => void }) {
  return (
    <div>
      <div className={classes.fieldLabel}>Open</div>
      <div className={classes.modeGrid} role="radiogroup" aria-label="Where the link opens">
        {OPTIONS.map(({ id, title, hint, icon: Icon }) => (
          <UnstyledButton
            key={id}
            role="radio"
            aria-checked={value === id}
            data-selected={value === id || undefined}
            className={classes.modeOption}
            onClick={() => onChange(id)}
          >
            <Icon size={17} className={classes.modeIcon} />
            <span className={classes.modeTitle}>{title}</span>
            <span className={classes.modeHint}>{hint}</span>
          </UnstyledButton>
        ))}
      </div>
    </div>
  );
}
