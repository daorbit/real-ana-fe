import { Text } from "@mantine/core";
import { Check } from "lucide-react";

/**
 * A bare tick rather than one in a filled disc: at eight or ten rows the discs
 * read as a column of buttons running down the card and pull more attention
 * than the words beside them.
 */
export function FeatureLine({ text }: { text: string }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
      <Check
        size={14}
        strokeWidth={3}
        style={{ flexShrink: 0, marginTop: 3, color: "var(--accent)" }}
        aria-hidden
      />
      <Text size="sm" c="dimmed" lh={1.45}>{text}</Text>
    </div>
  );
}
