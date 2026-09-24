import type { ReactNode } from "react";
import { Box, Text } from "@mantine/core";
import type { LucideIcon } from "lucide-react";
import classes from "./Developers.module.css";

interface Props {
  icon: LucideIcon;
  title: ReactNode;
  description: ReactNode;
  action?: ReactNode;
}

export function PanelHeader({ icon: Icon, title, description, action }: Props) {
  return (
    <Box className={classes.panelHead}>
      <span className={classes.panelIcon}>
        <Icon size={18} />
      </span>
      <Box className={classes.panelIntro}>
        <Text fw={650} size="md">
          {title}
        </Text>
        <Text size="sm" c="dimmed" mt={2}>
          {description}
        </Text>
      </Box>
      {action}
    </Box>
  );
}
