import type { ReactNode } from "react";
import { Badge, Box, Group, Text } from "@mantine/core";
import classes from "./ConnectionCard.module.css";

interface Props {
  mark: ReactNode;
  brand: string;
  name: string;
  hint: string;
  badge?: ReactNode;
  soon?: boolean;
  children?: ReactNode;
}

export function ConnectionCard({ mark, brand, name, hint, badge, soon, children }: Props) {
  return (
    <Box className={`connection-card${soon ? ` ${classes.soon}` : ""}`}>
      <Box aria-hidden className={`connection-card__mark ${classes.mark}`} data-brand={brand}>
        {mark}
      </Box>

      <Group gap={8} wrap="nowrap" align="center" mt="md">
        <Text fw={600}>{name}</Text>
        {soon ? (
          <Badge size="xs" variant="light" color="gray">
            Coming soon
          </Badge>
        ) : (
          badge
        )}
      </Group>
      <Text size="sm" c="dimmed" mt={4} className={classes.hint}>
        {hint}
      </Text>

      <Box mt="md">{children}</Box>
    </Box>
  );
}
