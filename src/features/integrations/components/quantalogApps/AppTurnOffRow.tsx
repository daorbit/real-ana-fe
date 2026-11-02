import { UnstyledButton } from "@mantine/core";
import { Power } from "lucide-react";
import classes from "./QuantalogApp.module.css";

export function AppTurnOffRow({
  name,
  note,
  disabled,
  onTurnOff,
}: {
  name: string;
  note: string;
  disabled: boolean;
  onTurnOff: () => void;
}) {
  return (
    <section aria-label="Turn off" className={classes.turnOff}>
      <UnstyledButton className={classes.turnOffRow} disabled={disabled} onClick={onTurnOff}>
        <Power size={16} />
        Turn off {name}
      </UnstyledButton>
      <p className={classes.turnOffNote}>{note} Workspace admins turn apps on and off.</p>
    </section>
  );
}
