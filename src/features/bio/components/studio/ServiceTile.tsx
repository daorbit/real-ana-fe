import { GripVertical } from "lucide-react";
import type { DragHandleProps } from "@/shared/ui/SortableList";
import type { BioServiceRow } from "@/features/bio/types";
import { ServiceLogo } from "../ServiceLogo";
import { ServiceEditPanel } from "./ServiceEditPanel";
import { PopoverPanel } from "./ui/PopoverPanel";
import classes from "./ui/Tiles.module.css";

export function ServiceTile({
  row,
  open,
  handle,
  onOpenChange,
  onChange,
  onRemove,
}: {
  row: BioServiceRow;
  open: boolean;
  handle: DragHandleProps;
  onOpenChange: (open: boolean) => void;
  onChange: (patch: Partial<BioServiceRow>) => void;
  onRemove: () => void;
}) {
  const name = row.name || "Custom";
  const missing = !row.url.trim();

  return (
    <div className={classes.tileWrap}>
      <PopoverPanel
        opened={open}
        onChange={onOpenChange}
        width={300}
        position="bottom"
        target={
          <button
            type="button"
            className={classes.tile}
            data-open={open || undefined}
            data-off={!row.enabled || undefined}
            aria-label={`Edit ${name}`}
            onClick={() => onOpenChange(!open)}
          >
            {missing && <span className={classes.dot} aria-label="Link missing" />}
            <span className={classes.tileLogo}>
              <ServiceLogo service={row.service} size="lg" />
            </span>
            <span className={classes.tileName}>{name}</span>
            <span className={classes.tileMeta}>{!row.enabled ? "Hidden" : missing ? "Add link" : row.action}</span>
          </button>
        }
      >
        <ServiceEditPanel
          row={row}
          onChange={onChange}
          onRemove={() => {
            onOpenChange(false);
            onRemove();
          }}
        />
      </PopoverPanel>
      <button type="button" className={classes.tileGrip} aria-label={`Drag to reorder ${name}`} {...handle}>
        <GripVertical size={13} />
      </button>
    </div>
  );
}
