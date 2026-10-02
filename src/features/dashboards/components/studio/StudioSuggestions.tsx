import { UnstyledButton } from "@mantine/core";
import type { OrbitStarter } from "@/features/dashboards/orbitStarters";
import classes from "@/features/dashboards/components/studio/Studio.module.css";

export function StudioSuggestions({
  starters,
  onPick,
  variant = "grid",
}: {
  starters: OrbitStarter[];
  onPick: (prompt: string) => void;
  variant?: "grid" | "list";
}) {
  return (
    <div className={classes.suggestions} data-variant={variant}>
      <div className={classes.sectionLabel}>Suggestions</div>
      <div className={classes.suggestList}>
        {starters.map(({ text, short, icon: Icon }) => (
          <UnstyledButton key={text} className={classes.suggest} onClick={() => onPick(text)}>
            <span className={classes.suggestIcon}><Icon size={15} /></span>
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
