import type { ReactNode } from "react";
import { Button, Text } from "@mantine/core";
import { ArrowRight, Lock } from "lucide-react";
import { useSearchUpgrade } from "../useSearchEntitlements";
import classes from "./searchConsole.module.css";

export function SearchUpgradeNote({ children }: { children: ReactNode }) {
  const { goToPlans } = useSearchUpgrade();
  return (
    <div className={classes.upgradeNote}>
      <span className={classes.upgradeIcon}>
        <Lock size={14} />
      </span>
      <Text size="sm" className={classes.upgradeText}>
        {children}
      </Text>
      <Button size="xs" variant="light" color="emerald" rightSection={<ArrowRight size={13} />} onClick={goToPlans}>
        See plans
      </Button>
    </div>
  );
}

export function SearchLockedFeature({
  title,
  description,
  preview,
}: {
  title: string;
  description: string;
  preview: ReactNode;
}) {
  const { goToPlans } = useSearchUpgrade();
  return (
    <div className={classes.locked}>
      <div className={classes.lockedPreview} aria-hidden>
        {preview}
      </div>
      <div className={classes.lockedOverlay}>
        <span className={classes.lockedIcon}>
          <Lock size={18} />
        </span>
        <Text fw={700} size="lg">
          {title}
        </Text>
        <Text size="sm" c="dimmed" className={classes.lockedText}>
          {description}
        </Text>
        <Button color="emerald" rightSection={<ArrowRight size={14} />} onClick={goToPlans}>
          See plans
        </Button>
      </div>
    </div>
  );
}
