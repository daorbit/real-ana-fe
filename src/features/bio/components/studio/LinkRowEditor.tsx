import type { DragHandleProps } from "@/shared/ui/SortableList";
import type { BioLink } from "@/features/bio/types";
import { DetailField, ExpandableRow } from "./ui/ExpandableRow";
import { LinkLead } from "./ui/LinkLead";
import { Toggle } from "./ui/Toggle";
import classes from "./ui/List.module.css";

export function LinkRowEditor({
  link,
  open,
  handle,
  onToggleOpen,
  onChange,
  onRemove,
}: {
  link: BioLink;
  open: boolean;
  handle: DragHandleProps;
  onToggleOpen: () => void;
  onChange: (patch: Partial<BioLink>) => void;
  onRemove: () => void;
}) {
  const name = link.label || "Untitled link";

  return (
    <ExpandableRow
      lead={<LinkLead label={link.label} url={link.url} size="sm" />}
      title={name}
      subtitle={link.url || "Add the link"}
      missing={!link.url.trim()}
      off={!link.enabled}
      open={open}
      handle={handle}
      onToggle={onToggleOpen}
      trailing={<Toggle size="sm" checked={link.enabled} label={link.enabled ? `Hide ${name}` : `Show ${name}`} onChange={(enabled) => onChange({ enabled })} />}
    >
      <DetailField label="Title">
        <input className={classes.input} placeholder="Book a call" maxLength={80} value={link.label} onChange={(e) => onChange({ label: e.currentTarget.value })} />
      </DetailField>
      <DetailField label="Link">
        <input
          autoFocus={!link.url}
          className={classes.input}
          placeholder="https://"
          inputMode="url"
          value={link.url}
          onChange={(e) => onChange({ url: e.currentTarget.value })}
        />
      </DetailField>
      <div className={classes.detailFoot}>
        <span />
        <button type="button" className={classes.deleteButton} onClick={onRemove}>
          Remove
        </button>
      </div>
    </ExpandableRow>
  );
}
