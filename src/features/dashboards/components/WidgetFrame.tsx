import type { ReactNode } from "react";
import { Button } from "@mantine/core";
import { Code2 } from "lucide-react";
import classes from "@/features/dashboards/components/Dashboards.module.css";

export function WidgetFrame({
  onEmbed,
  fresh = false,
  children,
}: {
  onEmbed?: () => void;
  fresh?: boolean;
  children: ReactNode;
}) {
  return (
    <div className={classes.frame} data-fresh={fresh || undefined}>
      {onEmbed && (
        <Button
          size="compact-xs"
          variant="default"
          radius="xl"
          className={classes.embedBtn}
          leftSection={<Code2 size={12} />}
          onClick={onEmbed}
        >
          Embed
        </Button>
      )}
      {children}
    </div>
  );
}
