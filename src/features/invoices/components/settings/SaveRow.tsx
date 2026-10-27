import { Button } from "@mantine/core";
import classes from "./SaveRow.module.css";

interface Props {
  dirty: boolean;
  saving: boolean;
  complete: boolean;
  onSave: () => void;
  onDiscard: () => void;
}

export function SaveRow({ dirty, saving, complete, onSave, onDiscard }: Props) {
  const status = dirty ? "You have unsaved changes" : complete ? "All changes saved" : "Not saved yet";

  return (
    <div className={classes.row}>
      <span className={classes.status} data-dirty={dirty || undefined}>
        <span className={classes.dot} aria-hidden />
        {status}
      </span>
      <div className={classes.actions}>
        {dirty && (
          <Button variant="subtle" color="gray" onClick={onDiscard} disabled={saving}>
            Discard
          </Button>
        )}
        <Button onClick={onSave} loading={saving} disabled={!dirty && complete}>
          Save details
        </Button>
      </div>
    </div>
  );
}
