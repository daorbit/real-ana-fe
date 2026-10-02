import { Tooltip, UnstyledButton } from "@mantine/core";
import type { OrbitStarter } from "@/features/dashboards/orbitStarters";
import classes from "@/features/dashboards/components/studio/Studio.module.css";

export function StudioSuggestions({
  starters,
  onPick,
  variant = "pills",
  align = "center",
}: {
  starters: OrbitStarter[];
  onPick: (prompt: string) => void;
  variant?: "pills" | "list";
  align?: "center" | "start";
}) {
  if (variant === "pills") {
    return (
      <div className={classes.pills} data-align={align}>
        {starters.map(({ text, short, icon: Icon }) => (
          <Tooltip key={text} label={text} withArrow openDelay={300}>
            <UnstyledButton className={classes.pill} onClick={() => onPick(text)}>
              <Icon size={13} />
              {short}
            </UnstyledButton>
          </Tooltip>
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className={classes.sectionLabel}>Suggestions</div>
      <div className={classes.suggestList}>
        {starters.map(({ text, short, icon: Icon }) => (
          <UnstyledButton key={text} className={classes.suggest} onClick={() => onPick(text)}>
            <span className={classes.suggestIcon}><Icon size={14} /></span>
            <span className={classes.suggestText}>
              <span className={classes.suggestTitle}>{short}</span>
              <span className={classes.suggestBody}>{text}</span>
            </span>
          </UnstyledButton>
        ))}
      </div>
    </div>
  );
}
