import { UnstyledButton } from "@mantine/core";
import { Plus } from "lucide-react";
import classes from "./SocialQueue.module.css";

function clock(iso: string): string {
  return new Date(iso).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

export function OpenSlots({
  slots,
  disabled,
  onCreate,
}: {
  slots: string[];
  disabled?: boolean;
  onCreate: (at: string) => void;
}) {
  return (
    <div className={classes.slots}>
      <span className={classes.slotsLabel}>{slots.length === 1 ? "Open slot" : "Open slots"}</span>
      <span className={classes.slotChips}>
        {slots.map((at) => (
          <UnstyledButton
            key={at}
            className={classes.slot}
            disabled={disabled}
            aria-label={`Schedule a post at ${clock(at)}`}
            onClick={() => onCreate(at)}
          >
            <Plus size={13} />
            {clock(at)}
          </UnstyledButton>
        ))}
      </span>
    </div>
  );
}
