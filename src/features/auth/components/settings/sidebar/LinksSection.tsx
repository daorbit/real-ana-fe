import { useState } from "react";
import { Button, UnstyledButton } from "@mantine/core";
import { ChevronRight, GripVertical, Link2, Plus } from "lucide-react";
import { LinkLogo } from "@/app/shell/LinkLogo";
import { MAX_CUSTOM_LINKS, linkPath, withLinkOrder, type CustomLink } from "@/app/shell/navPrefs";
import { SidebarCard } from "./SidebarCard";
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
      <SidebarCard
        title="Custom links"
        description="Shortcuts to the tools your team uses alongside Quantalog."
        action={
          editable &&
          !full && (
            <Button size="xs" variant="default" radius="md" leftSection={<Plus size={14} />} onClick={() => setEditing("new")}>
              Add link
            </Button>
          )
        }
        footer={full ? `You've added the maximum of ${MAX_CUSTOM_LINKS} links.` : undefined}
      >
        {prefs.links.length === 0 ? (
          <div className={classes.empty}>
            <span className={classes.emptyIcon}>
              <Link2 size={15} />
            </span>
            <span>No links yet. Add Stripe, Notion or any tool your team opens daily.</span>
          </div>
        ) : (
          <SortableList
            items={prefs.links}
            disabled={!editable}
            onReorder={(from, to) => apply(withLinkOrder(prefs, from, to))}
            renderItem={(link, handle) => (
              <div className={classes.row}>
                {editable && prefs.links.length > 1 && (
                  <span className={classes.grip} {...handle} aria-label={`Reorder ${link.label}`}>
                    <GripVertical size={15} />
                  </span>
                )}
                <UnstyledButton
                  className={classes.rowButton}
                  onClick={() => setEditing(link)}
                  disabled={!editable}
                  aria-label={editable ? `Edit ${link.label}` : link.label}
                >
                  <span className={classes.logoTile}>
                    <LinkLogo url={link.url} logoUrl={link.logoUrl} label={link.label} size={18} />
                  </span>
                  <span className={classes.rowText}>
                    <span className={classes.rowLabel}>{link.label}</span>
                    <span className={classes.rowHint}>
                      {link.mode === "internal" && link.slug ? linkPath(link.slug) : `${linkHost(link.url)} · New tab`}
                    </span>
                  </span>
                  {editable && <ChevronRight size={15} className={classes.chevron} />}
                </UnstyledButton>
              </div>
            )}
          />
        )}
      </SidebarCard>

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
