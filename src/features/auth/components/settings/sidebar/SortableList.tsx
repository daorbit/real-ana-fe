import type { ReactNode } from "react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import classes from "./Sidebar.module.css";

export type DragHandleProps = ReturnType<typeof useSortable>["listeners"] &
  ReturnType<typeof useSortable>["attributes"];

function SortableItem({
  id,
  disabled,
  children,
}: {
  id: string;
  disabled: boolean;
  children: (handle: DragHandleProps) => ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id, disabled });

  return (
    <div
      ref={setNodeRef}
      className={classes.sortable}
      data-dragging={isDragging || undefined}
      style={{ transform: CSS.Translate.toString(transform), transition }}
    >
      {children({ ...attributes, ...listeners } as DragHandleProps)}
    </div>
  );
}

export function SortableList<T extends { id: string }>({
  items,
  disabled = false,
  onReorder,
  renderItem,
}: {
  items: T[];
  disabled?: boolean;
  onReorder: (from: number, to: number) => void;
  renderItem: (item: T, handle: DragHandleProps) => ReactNode;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    const from = items.findIndex((i) => i.id === active.id);
    const to = items.findIndex((i) => i.id === over.id);
    onReorder(from, to);
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
        {items.map((item) => (
          <SortableItem key={item.id} id={item.id} disabled={disabled}>
            {(handle) => renderItem(item, handle)}
          </SortableItem>
        ))}
      </SortableContext>
    </DndContext>
  );
}
