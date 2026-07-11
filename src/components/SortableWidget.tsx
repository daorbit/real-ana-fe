import type { ReactNode } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { ActionIcon, Group, Paper, SegmentedControl, Text, Tooltip } from "@mantine/core";
import { GripVertical, X } from "lucide-react";
import type { Span, WidgetId } from "../hooks";

const SPANS: Span[] = [1, 2, 3, 4];

/**
 * Wraps a Home widget while the page is in edit mode: adds a drag handle, a
 * width control, and a remove button. Outside edit mode the child renders bare.
 *
 * Note: we deliberately do NOT apply dnd-kit's transform to the grid items.
 * The widgets have very different sizes, so the sortable transform carries a
 * scale that visibly warps the cards. Instead the item stays put (dimmed) and
 * a DragOverlay renders the card that follows the cursor.
 */
export function SortableWidget({
  id,
  span,
  label,
  editing,
  onSpan,
  onRemove,
  children,
}: {
  id: WidgetId;
  span: Span;
  label: string;
  editing: boolean;
  onSpan: (span: Span) => void;
  onRemove: () => void;
  children: ReactNode;
}) {
  const { attributes, listeners, setNodeRef, isDragging, isOver } = useSortable({
    id,
    disabled: !editing,
  });

  const style: React.CSSProperties = {
    // Span is capped at 4 because the grid is 4 columns wide.
    gridColumn: `span ${Math.min(span, 4)}`,
  };

  if (!editing) {
    return (
      <div ref={setNodeRef} style={style}>
        {children}
      </div>
    );
  }

  const cls = ["sw", isDragging && "is-dragging", isOver && "is-over"]
    .filter(Boolean)
    .join(" ");

  return (
    <div ref={setNodeRef} style={style} className={cls}>
      <Paper withBorder radius="lg" p={6} className="sw-frame">
        <Group justify="space-between" wrap="nowrap" px={4} pb={6}>
          <Group gap={6} wrap="nowrap" style={{ minWidth: 0 }}>
            <ActionIcon
              variant="subtle"
              color="gray"
              size="sm"
              className="sw-handle"
              {...attributes}
              {...listeners}
            >
              <GripVertical size={15} />
            </ActionIcon>
            <Text size="xs" fw={600} truncate>{label}</Text>
          </Group>

          <Group gap={6} wrap="nowrap">
            <Tooltip label="Width (columns)" withArrow>
              <SegmentedControl
                size="xs"
                value={String(span)}
                onChange={(v) => onSpan(Number(v) as Span)}
                data={SPANS.map((s) => ({ value: String(s), label: String(s) }))}
              />
            </Tooltip>
            <Tooltip label="Remove" withArrow>
              <ActionIcon variant="subtle" color="red" size="sm" onClick={onRemove}>
                <X size={14} />
              </ActionIcon>
            </Tooltip>
          </Group>
        </Group>

        {/* The real widget, made inert so clicks inside don't fight the drag. */}
        <div className="sw-body">{children}</div>
      </Paper>
    </div>
  );
}

/** The card that follows the cursor. Rendered inside dnd-kit's DragOverlay. */
export function WidgetDragPreview({ label }: { label: string }) {
  return (
    <Paper withBorder radius="lg" p="md" className="sw-overlay">
      <Group gap={8} wrap="nowrap">
        <GripVertical size={16} />
        <Text size="sm" fw={650}>{label}</Text>
      </Group>
      <Text size="xs" c="dimmed" mt={4}>Drop to place</Text>
    </Paper>
  );
}
