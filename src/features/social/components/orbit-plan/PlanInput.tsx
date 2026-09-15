import { ActionIcon, Group, Textarea } from "@mantine/core";
import { ArrowUp } from "lucide-react";
import classes from "./planInput.module.css";

export function PlanInput({
  value,
  onChange,
  onSend,
  thinking,
  placeholder,
  minRows = 1,
}: {
  value: string;
  onChange: (next: string) => void;
  onSend: () => void;
  thinking: boolean;
  placeholder: string;
  minRows?: number;
}) {
  return (
    <div className={classes.composer}>
      <Group gap="sm" align="flex-end" wrap="nowrap">
        <Textarea
          autosize
          minRows={minRows}
          maxRows={Math.max(5, minRows + 3)}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.currentTarget.value)}
          onKeyDown={(e) => {
            // Enter sends, shift+enter breaks the line.
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              onSend();
            }
          }}
          variant="unstyled"
          disabled={thinking}
          styles={{
            input: {
              fontSize: 14,
              lineHeight: 1.6,
              background: "transparent",
              border: "none",
              boxShadow: "none",
            },
          }}
          style={{ flex: 1 }}
        />
        <ActionIcon
          size="md"
          radius="xl"
          color="emerald"
          variant="filled"
          loading={thinking}
          disabled={!value.trim()}
          onClick={onSend}
          aria-label="Send to Orbit"
        >
          <ArrowUp size={16} />
        </ActionIcon>
      </Group>
    </div>
  );
}
