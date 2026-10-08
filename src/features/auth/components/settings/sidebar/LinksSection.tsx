import { useState } from "react";
import { UnstyledButton } from "@mantine/core";
import { ChevronRight, GripVertical, Plus } from "lucide-react";
import { LinkLogo } from "@/app/shell/LinkLogo";
import { MAX_CUSTOM_LINKS, linkPath, withLinkOrder, type CustomLink } from "@/app/shell/navPrefs";
import { InsetSection } from "./InsetSection";
import { SortableList } from "./SortableList";
import { LinkSheet } from "./LinkSheet";
import { linkHost } from "@/features/customLinks/lib/linkUrl";
import type { NavPrefsEditor } from "./useNavPrefsEditor";
import classes from "./Sidebar.module.css";

export function LinksSection({ editor }: { editor: NavPrefsEditor }) {
  const { prefs, editable, apply } = editor;
  const [editing, setEditing] = useState<CustomLink | "new" | null>(null);
  const full = prefs.links.length >= MAX_CUSTOM_LINKS;

  return (
    <>
      <InsetSection
        title="Links"
        footer={
          full
            ? `You've added the maximum of ${MAX_CUSTOM_LINKS} links.`
            : "Shortcuts to the tools your team uses alongside Quantalog. They open in a new tab."
        }
      >
        <SortableList
          items={prefs.links}
          disabled={!editable}
          onReorder={(from, to) => apply(withLinkOrder(prefs, from, to))}
          renderItem={(link, handle) => (
            <div className={classes.row}>
              <UnstyledButton
                className={classes.rowButton}
                onClick={() => setEditing(link)}
                disabled={!editable}
                aria-label={editable ? `Edit ${link.label}` : link.label}
              >
                <span className={classes.logoTile}>
                  <LinkLogo url={link.url} logoUrl={link.logoUrl} label={link.label} size={20} />
                </span>
                <span className={classes.rowText}>
                  <span className={classes.rowLabel}>{link.label}</span>
                  <span className={classes.rowHint}>
                    {link.mode === "internal" && link.slug ? linkPath(link.slug) : `${linkHost(link.url)} · New tab`}
                  </span>
                </span>
                {editable && <ChevronRight size={16} className={classes.chevron} />}
              </UnstyledButton>
              {editable && (
                <span className={classes.grip} {...handle} aria-label={`Reorder ${link.label}`}>
                  <GripVertical size={16} />
                </span>
              )}
            </div>
          )}
        />

        {editable && !full && (
          <UnstyledButton className={classes.addRow} onClick={() => setEditing("new")}>
            <span className={classes.addIcon}>
              <Plus size={15} />
            </span>
            Add link
          </UnstyledButton>
        )}

        {!editable && prefs.links.length === 0 && <div className={classes.empty}>No links yet.</div>}
      </InsetSection>

      <LinkSheet
        key={editing === "new" ? "new" : editing?.id ?? "closed"}
        opened={editing !== null}
        link={editing === "new" ? null : editing}
        editor={editor}
        onClose={() => setEditing(null)}
      />
    </>
  );
}
