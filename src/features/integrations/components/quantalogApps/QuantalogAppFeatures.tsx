import { Text } from "@mantine/core";
import { ListChecks, TrendingUp, Trophy, type LucideIcon } from "lucide-react";
import type { WorkspaceAppInfo } from "../../lib/quantalogApps";
import classes from "./QuantalogApp.module.css";

const ICONS: LucideIcon[] = [Trophy, TrendingUp, ListChecks];

export function QuantalogAppFeatures({ info }: { info: WorkspaceAppInfo }) {
  return (
    <div className={classes.features}>
      {info.features.map((feature, index) => {
        const Icon = ICONS[index % ICONS.length];
        return (
          <div key={feature.title} className={classes.feature}>
            <span className={classes.featureIcon}>
              <Icon size={17} />
            </span>
            <Text size="sm" fw={600}>
              {feature.title}
            </Text>
            <Text size="xs" c="dimmed">
              {feature.body}
            </Text>
          </div>
        );
      })}
    </div>
  );
}
