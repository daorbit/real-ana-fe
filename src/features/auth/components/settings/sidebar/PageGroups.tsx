import { UnstyledButton } from "@mantine/core";
import { RotateCcw } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { NavGroup } from "@/app/shell/navItems";
import { LOCKED_NAV_ITEMS, navItemState, withDefaultPages, withItemState } from "@/app/shell/navPrefs";
import { InsetSection } from "./InsetSection";
import { PageRow } from "./PageRow";
import type { NavPrefsEditor } from "./useNavPrefsEditor";
import classes from "./Sidebar.module.css";

export function PageGroups({ editor, groups }: { editor: NavPrefsEditor; groups: NavGroup[] }) {
  const { t } = useTranslation();
  const { prefs, editable, apply } = editor;

  return (
    <>
      {groups.map((group) => {
        const rows = group.items.filter((item) => navItemState(prefs, item.to) !== "pinned");
        if (rows.length === 0) return null;
        return (
          <InsetSection key={group.headingKey} title={t(group.headingKey, group.heading)}>
            {rows.map((item) => {
              const hidden = navItemState(prefs, item.to) === "hidden";
              return (
                <PageRow
                  key={item.to}
                  item={item}
                  label={t(item.labelKey, item.label)}
                  hidden={hidden}
                  locked={LOCKED_NAV_ITEMS.has(item.to)}
                  editable={editable}
                  onPin={() => apply(withItemState(prefs, item.to, "pinned"))}
                  onToggleHidden={() => apply(withItemState(prefs, item.to, hidden ? "shown" : "hidden"))}
                />
              );
            })}
          </InsetSection>
        );
      })}
    </>
  );
}

export function PagesFoot({ editor }: { editor: NavPrefsEditor }) {
  const { prefs, editable, apply } = editor;
  const customised = prefs.hidden.length > 0 || prefs.pinned.length > 0;

  return (
    <p className={classes.pageFoot}>
      Hidden pages are still available from search (Ctrl K).
      {editable && customised && (
        <UnstyledButton className={classes.resetLink} onClick={() => apply(withDefaultPages(prefs))}>
          <RotateCcw size={13} />
          Restore default pages
        </UnstyledButton>
      )}
    </p>
  );
}
