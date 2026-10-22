import type { ReactNode } from "react";
import { Box, Group, Text } from "@mantine/core";
import classes from "./ConnectionGroup.module.css";

interface Props {
  title: string;
  hint: string;
  aside?: ReactNode;
  children: ReactNode;
}

export function ConnectionGroup({ title, hint, aside, children }: Props) {
  return (
    <Box component="section" className={classes.group}>
      <Group justify="space-between" align="flex-end" wrap="nowrap" mb="sm">
        <Box>
          <Text fw={600} className={classes.title}>
            {title}
          </Text>
          <Text c="dimmed" size="sm" mt={2}>
            {hint}
          </Text>
        </Box>
        {aside}
      </Group>
      <div className="connection-grid">{children}</div>
    </Box>
  );
}
