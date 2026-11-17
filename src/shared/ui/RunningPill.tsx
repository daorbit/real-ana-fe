import { Group, Portal, Text, UnstyledButton } from "@mantine/core";
import { Check, Maximize2 } from "lucide-react";
import "@/shared/ui/RunningDialog.css";

export function RunningPill({
  done,
  label,
  successMessage,
  onRestore,
}: {
  done: boolean;
  label: string;
  successMessage: string;
  onRestore: () => void;
}) {
  return (
    <Portal>
      <UnstyledButton
        className={`running-pill${done ? " running-pill--done" : ""}`}
        onClick={() => !done && onRestore()}
        aria-live="polite"
        title={done ? successMessage : "Show details"}
      >
        {done ? (
          <span className="running-pill__icon running-pill__icon--check">
            <Check size={13} strokeWidth={3} />
          </span>
        ) : (
          <span className="running-pill__icon running-pill__icon--spin" />
        )}

        <Group gap={8} wrap="nowrap" className="running-pill__label">
          <Text size="sm" fw={500} truncate>
            {done ? successMessage : label}
          </Text>
          {!done && <Maximize2 size={13} opacity={0.5} />}
        </Group>

        {!done && <span className="running-pill__line" />}
      </UnstyledButton>
    </Portal>
  );
}
