import { Button } from "@mantine/core";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ChevronDown, ChevronRight, Copy, GripVertical, Trash2 } from "lucide-react";
import { BLOCK_INFO, blockSummary } from "@/features/campaigns/lib/emailDesign";
import type { EmailBlock } from "@/features/campaigns/types";
import { BlockFields } from "./BlockFields";
import classes from "./Editor.module.css";

interface Props {
  block: EmailBlock;
  expanded: boolean;
  onToggle: () => void;
  onChange: (patch: Partial<EmailBlock>) => void;
  onDuplicate: () => void;
  onRemove: () => void;
}

export function BlockRow({ block, expanded, onToggle, onChange, onDuplicate, onRemove }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.id });
  const info = BLOCK_INFO[block.type];
  const Icon = info.icon;
  const Chevron = expanded ? ChevronDown : ChevronRight;

  return (
    <div
      ref={setNodeRef}
      className={classes.block}
      data-dragging={isDragging || undefined}
      style={{ transform: CSS.Transform.toString(transform), transition }}
    >
      <div className={classes.blockHead}>
        <button type="button" className={classes.grip} aria-label={`Move ${info.label}`} {...attributes} {...listeners}>
          <GripVertical size={16} aria-hidden />
        </button>
        <button type="button" className={classes.blockOpen} aria-expanded={expanded} onClick={onToggle}>
          <Icon size={17} className={classes.blockIcon} aria-hidden />
          <span className={classes.blockText}>
            <span className={classes.blockName}>{info.label}</span>
            <span className={classes.blockSummary}>{blockSummary(block)}</span>
          </span>
          <Chevron size={16} className={classes.chevron} aria-hidden />
        </button>
      </div>
      {expanded && (
        <div className={classes.blockBody}>
          <BlockFields block={block} onChange={onChange} />
          <div className={classes.blockActions}>
            <Button variant="subtle" size="compact-sm" color="gray" leftSection={<Copy size={13} />} onClick={onDuplicate}>
              Duplicate
            </Button>
            <Button variant="subtle" size="compact-sm" color="red" leftSection={<Trash2 size={13} />} onClick={onRemove}>
              Remove
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
