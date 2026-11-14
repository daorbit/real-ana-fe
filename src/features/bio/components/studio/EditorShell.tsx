import type { ReactNode } from "react";
import classes from "./Editor.module.css";

export function EditorShell({ disabled, content, design }: { disabled: boolean; content: ReactNode; design: ReactNode }) {
  return (
    <fieldset className={classes.body} disabled={disabled}>
      {content}
      <h2 className={classes.partTitle}>Design</h2>
      {design}
    </fieldset>
  );
}
