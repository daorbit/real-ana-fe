import type { ReactNode } from "react";
import { Box, Group, Text } from "@mantine/core";
import type { LucideIcon } from "lucide-react";
import classes from "./SettingsCard.module.css";

interface Props {
  title: ReactNode;
  description?: ReactNode;
  icon?: LucideIcon;
  badge?: ReactNode;
  action?: ReactNode;
  flush?: boolean;
  children?: ReactNode;
}

export function SettingsCard({ title, description, icon: Icon, badge, action, flush = false, children }: Props) {
  return (
    <Box component="section" className={classes.card}>
      <Box className={classes.head} data-alone={children ? undefined : true}>
        {Icon && (
          <span className={classes.headIcon}>
            <Icon size={17} />
          </span>
        )}
        <Box className={classes.headText}>
          <Group gap={8} wrap="nowrap">
            <Text fw={650} size="sm">
              {title}
            </Text>
            {badge}
          </Group>
          {description && (
            <Text size="xs" c="dimmed" mt={3}>
              {description}
            </Text>
          )}
        </Box>
        {action}
      </Box>
      {children && <Box className={flush ? classes.flush : classes.body}>{children}</Box>}
    </Box>
  );
}

export function SettingsStack({ children }: { children: ReactNode }) {
  return <Box className={classes.stack}>{children}</Box>;
}

export function SaveBarSpacer() {
  return <Box className={classes.spacer} aria-hidden />;
}
