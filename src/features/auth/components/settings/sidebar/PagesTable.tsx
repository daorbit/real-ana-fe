import { useMemo, useState } from "react";
import { TextInput, UnstyledButton } from "@mantine/core";
import { RotateCcw, Search } from "lucide-react";
import { useTranslation } from "react-i18next";
import { NAV_GROUPS } from "@/app/shell/navItems";
import { LOCKED_NAV_ITEMS, navItemState, withDefaultPages, withItemState } from "@/app/shell/navPrefs";
import { SidebarCard } from "./SidebarCard";
import { PageRow } from "./PageRow";
import type { NavPrefsEditor } from "./useNavPrefsEditor";
import classes from "./Sidebar.module.css";

const ENTRIES = NAV_GROUPS.flatMap((group) => group.items.map((item) => ({ item, group })));

export function PagesTable({ editor }: { editor: NavPrefsEditor }) {
  const { t } = useTranslation();
  const { prefs, editable, apply } = editor;
  const [query, setQuery] = useState("");

  const rows = useMemo(
    () =>
      ENTRIES.map(({ item, group }) => ({
        item,
        label: t(item.labelKey, item.label),
        section: t(group.headingKey, group.heading),
        state: navItemState(prefs, item.to),
      })),
    [prefs, t],
  );

  const needle = query.trim().toLowerCase();
  const matches = needle
    ? rows.filter((r) => r.label.toLowerCase().includes(needle) || r.section.toLowerCase().includes(needle))
    : rows;
  const shownCount = rows.filter((r) => r.state !== "hidden").length;
  const customised = prefs.hidden.length > 0 || prefs.pinned.length > 0;

  return (
    <SidebarCard
      title="Pages"
      description={`${shownCount} of ${rows.length} shown in the sidebar. Hidden pages stay reachable from search (Ctrl K).`}
      action={
        <TextInput
          className={classes.search}
          size="sm"
          radius="md"
          placeholder="Search pages"
          leftSection={<Search size={14} />}
          value={query}
          onChange={(e) => setQuery(e.currentTarget.value)}
          aria-label="Search pages"
        />
      }
      footer={
        editable &&
        customised && (
          <UnstyledButton className={classes.resetLink} onClick={() => apply(withDefaultPages(prefs))}>
            <RotateCcw size={13} />
            Restore default pages
          </UnstyledButton>
        )
      }
    >
      <div className={classes.tableHead}>
        <span>Page</span>
        <span className={classes.pageSection}>Section</span>
        <span className={classes.cell}>Pin</span>
        <span className={classes.cell}>Show</span>
      </div>
      {matches.map(({ item, label, section, state }) => {
        const pinned = state === "pinned";
        const hidden = state === "hidden";
        return (
          <PageRow
            key={item.to}
            item={item}
            label={label}
            section={section}
            pinned={pinned}
            hidden={hidden}
            locked={LOCKED_NAV_ITEMS.has(item.to)}
            editable={editable}
            onTogglePin={() => apply(withItemState(prefs, item.to, pinned ? "shown" : "pinned"))}
            onToggleShown={() => apply(withItemState(prefs, item.to, hidden ? "shown" : "hidden"))}
          />
        );
      })}
      {matches.length === 0 && <div className={classes.empty}>No pages match “{query.trim()}”.</div>}
    </SidebarCard>
  );
}
