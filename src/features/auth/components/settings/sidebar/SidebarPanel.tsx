import { Button } from "@mantine/core";
import { PanelLeft, RotateCcw } from "lucide-react";
import { useTranslation } from "react-i18next";
import { NAV_GROUPS } from "@/app/shell/navItems";
import { navItemState, resetNavPrefs, useNavPrefs } from "@/app/shell/navPrefs";
import { SettingsCard, SettingsStack } from "../SettingsCard";
import { SidebarItemRow } from "./SidebarItemRow";
import { SidebarPreview } from "./SidebarPreview";
import classes from "./Sidebar.module.css";

export function SidebarPanel() {
  const { t } = useTranslation();
  const prefs = useNavPrefs();
  const customised = prefs.hidden.length > 0 || prefs.pinned.length > 0;

  return (
    <SettingsStack>
      <SettingsCard
        icon={PanelLeft}
        title="Sidebar pages"
        description="Pin pages to the top or hide the ones you don't use. Hidden pages stay in search (Ctrl K)."
        action={
          <Button
            variant="default"
            size="xs"
            leftSection={<RotateCcw size={14} />}
            disabled={!customised}
            onClick={resetNavPrefs}
          >
            Reset
          </Button>
        }
        flush
      >
        <div className={classes.layout}>
          <div className={classes.editor}>
            {NAV_GROUPS.map((group) => (
              <section key={group.headingKey} className={classes.group}>
                <h3 className={classes.groupHeading}>{t(group.headingKey, group.heading)}</h3>
                {group.items.map((item) => (
                  <SidebarItemRow key={item.to} item={item} state={navItemState(prefs, item.to)} />
                ))}
              </section>
            ))}
          </div>
          <aside className={classes.previewCol}>
            <SidebarPreview prefs={prefs} />
          </aside>
        </div>
      </SettingsCard>
    </SettingsStack>
  );
}
