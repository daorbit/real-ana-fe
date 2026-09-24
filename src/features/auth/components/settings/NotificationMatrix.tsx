import { Badge, Box, Switch, Text } from "@mantine/core";
import { Lock } from "lucide-react";
import { useTranslation } from "react-i18next";
import { notificationTypeLabel } from "@/features/activity/copy";
import { NOTIFICATION_VISUALS } from "@/features/activity/visuals";
import type { NotificationPreference } from "@/shared/types";
import { SettingsCard } from "./SettingsCard";
import type { NotificationGroup } from "./notificationGroups";
import classes from "./Notifications.module.css";

interface Props {
  group: NotificationGroup;
  items: NotificationPreference[];
  pushOn: boolean;
  onChange: (type: string, channel: "inApp" | "push", value: boolean) => void;
}

export function NotificationMatrix({ group, items, pushOn, onChange }: Props) {
  const { t } = useTranslation();
  const pushLabel = t("activity.pref.push", "Push");

  return (
    <SettingsCard
      icon={group.icon}
      title={t(group.titleKey, group.title)}
      description={t(group.descriptionKey, group.description)}
      flush
    >
      <Box className={classes.matrix} role="table">
        <Box className={`${classes.row} ${classes.headRow}`} role="row">
          <span className={classes.colHead} role="columnheader">
            {t("activity.pref.type", "Notification")}
          </span>
          <span className={`${classes.colHead} ${classes.cell}`} role="columnheader">
            {t("activity.pref.inApp", "In app")}
          </span>
          <span className={`${classes.colHead} ${classes.cell}`} role="columnheader">
            {pushLabel}
          </span>
        </Box>

        {items.map((item) => {
          const visual = NOTIFICATION_VISUALS[item.type];
          const Icon = visual.icon;
          const label = notificationTypeLabel(item.type, t);

          return (
            <Box key={item.type} className={classes.row} role="row">
              <Box className={classes.type} role="cell">
                <Box
                  className={classes.typeIcon}
                  data-image={visual.image ? true : undefined}
                  __vars={{ "--type-color": `var(--mantine-color-${visual.color}-5)` }}
                >
                  {visual.image ? (
                    <img src={visual.image} alt="" className={classes.typeImg} />
                  ) : (
                    <Icon size={16} strokeWidth={2} />
                  )}
                </Box>
                <Box>
                  <Text fz="sm" fw={500}>
                    {label}
                  </Text>
                  {!item.optional && (
                    <Badge size="xs" variant="light" color="gray" tt="none" mt={3} leftSection={<Lock size={10} />}>
                      {t("activity.pref.always", "Always on")}
                    </Badge>
                  )}
                </Box>
              </Box>

              <Box className={classes.cell} role="cell">
                <Switch
                  className={classes.switch}
                  checked={item.inApp}
                  disabled={!item.optional}
                  onChange={(e) => onChange(item.type, "inApp", e.currentTarget.checked)}
                  aria-label={`${label}: ${t("activity.pref.inApp", "In app")}`}
                />
              </Box>

              <Box className={classes.cell} role="cell">
                {item.pushable ? (
                  <Switch
                    className={classes.switch}
                    checked={item.push && pushOn}
                    disabled={!item.optional || !pushOn}
                    onChange={(e) => onChange(item.type, "push", e.currentTarget.checked)}
                    aria-label={`${label}: ${pushLabel}`}
                  />
                ) : (
                  <span className={classes.dash}>—</span>
                )}
              </Box>
            </Box>
          );
        })}
      </Box>
    </SettingsCard>
  );
}
