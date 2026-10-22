import { ActionIcon, Button, Switch, TextInput, Tooltip } from "@mantine/core";
import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";
import { num } from "@/shared/lib";
import { BIO_MAX_LINKS } from "@/features/bio/lib/bioOptions";
import type { BioLink } from "@/features/bio/types";
import { StudioCard } from "./StudioCard";
import classes from "./BioStudio.module.css";

export function LinksSection({
  links,
  linkClicks,
  onAdd,
  onUpdate,
  onRemove,
  onMove,
}: {
  links: BioLink[];
  linkClicks?: Record<string, number>;
  onAdd: () => void;
  onUpdate: (id: string, patch: Partial<BioLink>) => void;
  onRemove: (id: string) => void;
  onMove: (id: string, offset: -1 | 1) => void;
}) {
  return (
    <StudioCard title="Links" description="Buttons on your page, top to bottom. Turn one off to hide it without deleting it.">
      {links.length === 0 ? (
        <div className={classes.empty}>No links yet. Add your first one below.</div>
      ) : (
        <div className={classes.list}>
          {links.map((link, index) => (
            <div key={link.id} className={classes.listRow} data-off={!link.enabled || undefined}>
              <div className={classes.rowOrder}>
                <ActionIcon
                  variant="subtle"
                  color="gray"
                  size="sm"
                  aria-label="Move up"
                  disabled={index === 0}
                  onClick={() => onMove(link.id, -1)}
                >
                  <ChevronUp size={15} />
                </ActionIcon>
                <ActionIcon
                  variant="subtle"
                  color="gray"
                  size="sm"
                  aria-label="Move down"
                  disabled={index === links.length - 1}
                  onClick={() => onMove(link.id, 1)}
                >
                  <ChevronDown size={15} />
                </ActionIcon>
              </div>

              <div className={classes.rowFields}>
                <TextInput
                  size="sm"
                  placeholder="Title, like Book a call"
                  aria-label="Link title"
                  maxLength={80}
                  value={link.label}
                  onChange={(e) => onUpdate(link.id, { label: e.currentTarget.value })}
                />
                <TextInput
                  size="sm"
                  placeholder="https://"
                  aria-label="Link address"
                  value={link.url}
                  onChange={(e) => onUpdate(link.id, { url: e.currentTarget.value })}
                />
              </div>

              <div className={classes.rowSide}>
                <Switch
                  size="sm"
                  aria-label={link.enabled ? "Hide link" : "Show link"}
                  checked={link.enabled}
                  onChange={(e) => onUpdate(link.id, { enabled: e.currentTarget.checked })}
                />
                {linkClicks?.[link.id] !== undefined && (
                  <span className={classes.rowClicks}>{num(linkClicks[link.id])} clicks</span>
                )}
                <Tooltip label="Delete link" withArrow>
                  <ActionIcon variant="subtle" color="gray" size="sm" aria-label="Delete link" onClick={() => onRemove(link.id)}>
                    <Trash2 size={15} />
                  </ActionIcon>
                </Tooltip>
              </div>
            </div>
          ))}
        </div>
      )}

      <Button variant="default" leftSection={<Plus size={15} />} disabled={links.length >= BIO_MAX_LINKS} onClick={onAdd}>
        Add link
      </Button>
    </StudioCard>
  );
}
