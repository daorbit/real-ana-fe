import type { ReactNode } from "react";
import { ActionIcon, Badge, Box, Group, Text, Tooltip } from "@mantine/core";
import { BookOpen, Check } from "lucide-react";
import classes from "./ConnectionCard.module.css";

export type ConnectionCardStatus = "connected" | "attention" | "idle";

interface Props {
  mark: ReactNode;
  brand: string;
  name: string;
  hint: string;
  badge?: ReactNode;
  soon?: boolean;
  docsUrl?: string;
  status?: ConnectionCardStatus;
  celebrate?: boolean;
  children?: ReactNode;
}

export function ConnectionCard({ mark, brand, name, hint, badge, soon, docsUrl, status, celebrate, children }: Props) {
  return (
    <Box
      className={`connection-card ${classes.card}${soon ? ` ${classes.soon}` : ""}`}
      data-brand={brand}
      data-status={status}
      data-celebrate={celebrate || undefined}
    >
      {docsUrl && (
        <Tooltip label={`${name} setup guide`} withArrow>
          <ActionIcon
            component="a"
            href={docsUrl}
            target="_blank"
            rel="noreferrer"
            variant="subtle"
            color="gray"
            size="md"
            className={classes.docs}
            aria-label={`${name} setup guide`}
          >
            <BookOpen size={15} />
          </ActionIcon>
        </Tooltip>
      )}

      <Box aria-hidden className={`connection-card__mark ${classes.mark}`}>
        {mark}
        {status === "connected" && (
          <span className={classes.markBadge}>
            <Check size={11} strokeWidth={3} />
          </span>
        )}
      </Box>

      <Group gap={8} wrap="nowrap" align="center" mt="md" className={classes.nameRow}>
        <Text fw={600} className={classes.name}>{name}</Text>
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
