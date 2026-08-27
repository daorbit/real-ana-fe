import { Group, Text, ThemeIcon } from "@mantine/core";
import { Check } from "lucide-react";

export function FeatureLine({ text }: { text: string }) {
  return (
    <Group gap={8} wrap="nowrap">
      <ThemeIcon size={17} radius="xl" variant="light" color="emerald">
        <Check size={10} />
      </ThemeIcon>
      <Text size="sm" c="dimmed">{text}</Text>
    </Group>
  );
}
