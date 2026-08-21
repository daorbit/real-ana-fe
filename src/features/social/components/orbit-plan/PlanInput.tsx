import { ActionIcon, Group, Textarea } from "@mantine/core";
import { ArrowUp } from "lucide-react";

export function PlanInput({
  value,
  onChange,
  onSend,
  thinking,
  placeholder,
}: {
  value: string;
  onChange: (next: string) => void;
  onSend: () => void;
  thinking: boolean;
  placeholder: string;
}) {
  return (
    <Group gap="sm" align="flex-end" wrap="nowrap">
      <Textarea
        autosize
        minRows={1}
        maxRows={5}
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
        style={{ flex: 1 }}
      />
      <ActionIcon
        size="lg"
        radius="md"
        color="emerald"
        variant="filled"
        loading={thinking}
        disabled={!value.trim()}
        onClick={onSend}
        aria-label="Send to Orbit"
      >
        <ArrowUp size={17} />
      </ActionIcon>
    </Group>
  );
}
