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
      <Group justify="space-between" align="flex-end" wrap="nowrap" mb="lg">
        <Box>
          <Text fw={650} size="sm" className={classes.title}>
            {title}
          </Text>
          <Text c="dimmed" size="xs" mt={2}>
            {hint}
          </Text>
        </Box>
        {aside}
      </Group>
      <div className="connection-grid">{children}</div>
    </Box>
  );
}
