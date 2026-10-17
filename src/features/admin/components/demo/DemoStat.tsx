import { Card, Text, ThemeIcon } from "@mantine/core";
import type { LucideIcon } from "lucide-react";
import classes from "./DemoStat.module.css";

export function DemoStat({ icon: Icon, label, value, tone }: { icon: LucideIcon; label: string; value: string; tone?: "warn" }) {
  return (
    <Card withBorder radius="lg" padding="lg">
      <ThemeIcon size={30} radius="md" variant="light" color={tone === "warn" ? "yellow" : "gray"} mb="sm">
        <Icon size={15} />
      </ThemeIcon>
      <div className={classes.value} data-tone={tone}>{value}</div>
      <Text size="xs" c="dimmed" mt={4}>{label}</Text>
    </Card>
  );
}
