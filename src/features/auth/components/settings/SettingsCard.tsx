import type { ReactNode } from "react";
import { Box } from "@mantine/core";
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

export function SettingsCard({ title, description, badge, action, flush = false, children }: Props) {
  return (
    <Box component="section" className={classes.group}>
      <header className={classes.head}>
        <div className={classes.headText}>
          <div className={classes.titleRow}>
            <h3 className={classes.title}>{title}</h3>
            {badge}
          </div>
          {description && <p className={classes.description}>{description}</p>}
        </div>
        {action}
      </header>
      {children && (
        <div className={classes.card}>
          <div className={flush ? classes.flush : classes.body}>{children}</div>
        </div>
      )}
    </Box>
  );
}

export function SettingsStack({ children }: { children: ReactNode }) {
  return <Box className={classes.stack}>{children}</Box>;
}

export function SaveBarSpacer() {
  return <Box className={classes.spacer} aria-hidden />;
}
