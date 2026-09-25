import { Anchor } from "@mantine/core";
import type { SeoSection } from "../sections";
import classes from "./SeoLayout.module.css";

interface Props {
  section: SeoSection;
  onHelp: () => void;
}

export function SeoSectionHeader({ section, onHelp }: Props) {
  return (
    <header className={classes.sectionHead}>
      <h2 className={classes.sectionTitle}>{section.label}</h2>
      <p className={classes.sectionDesc}>
        {section.description}{" "}
        <Anchor component="button" type="button" size="sm" onClick={onHelp} className={classes.learnMore}>
          Learn more
        </Anchor>
      </p>
    </header>
  );
}
