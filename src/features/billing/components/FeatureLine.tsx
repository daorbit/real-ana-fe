import { Text } from "@mantine/core";
import { Check } from "lucide-react";

 
export function FeatureLine({ text, color }: { text: string; color?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
      <Check
        size={14}
        strokeWidth={3}
        style={{ flexShrink: 0, marginTop: 3, color: color ?? "var(--accent)" }}
        aria-hidden
      />
      <Text size="sm" c="dimmed" lh={1.45}>{text}</Text>
    </div>
  );
}
