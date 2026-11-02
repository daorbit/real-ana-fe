import type { ReactNode } from "react";
import { ActionIcon, Box, Group, Text, Tooltip } from "@mantine/core";
import { BookOpen } from "lucide-react";
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
      <div className={classes.top}>
        <Box aria-hidden className={`connection-card__mark ${classes.mark}`}>
          {mark}
        </Box>
        {soon && <span className={classes.soonPill}>Coming soon</span>}
      </div>

      <Group gap={8} wrap="nowrap" align="center" className={classes.nameRow}>
        <Text fw={650} className={classes.name}>
          {name}
        </Text>
        {!soon && badge}
      </Group>
      <Text c="dimmed" mt={4} lh={1.45} className={classes.hint}>
        {hint}
      </Text>

      <div className={classes.foot}>
        {children}
        {docsUrl && (
          <Tooltip label={`${name} setup guide`} withArrow>
            <ActionIcon
              component="a"
              href={docsUrl}
              target="_blank"
              rel="noreferrer"
              variant="subtle"
              color="gray"
              size="sm"
              className={classes.docs}
              aria-label={`${name} setup guide`}
            >
              <BookOpen size={14} />
            </ActionIcon>
          </Tooltip>
        )}
      </div>
    </Box>
  );
}
