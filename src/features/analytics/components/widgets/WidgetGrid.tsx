import { useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import {
  DndContext, DragOverlay, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors,
} from "@dnd-kit/core";
import type { DragEndEvent, DragStartEvent } from "@dnd-kit/core";
import { SortableContext, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { SortableWidget, WidgetDragPreview } from "@/shared/ui/SortableWidget";
import { WIDGET_MAP } from "@/features/analytics/widgetCatalog";
import type { Placed, Span, WidgetId } from "@/features/analytics/widgetCatalog";
import classes from "@/features/analytics/components/widgets/Widgets.module.css";

export function WidgetGrid({
  layout,
  editing,
  onMove,
  onSpan,
  onRemove,
  render,
}: {
  layout: Placed[];
  editing: boolean;
  onMove: (from: number, to: number) => void;
  onSpan: (id: WidgetId, span: Span) => void;
  onRemove: (id: WidgetId) => void;
  render: (id: WidgetId) => ReactNode;
}) {
  const [dragging, setDragging] = useState<WidgetId | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const onDragStart = (e: DragStartEvent) => setDragging(e.active.id as WidgetId);

  const onDragEnd = (e: DragEndEvent) => {
    setDragging(null);
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    onMove(
      layout.findIndex((p) => p.id === active.id),
      layout.findIndex((p) => p.id === over.id)
    );
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragCancel={() => setDragging(null)}
    >
      <SortableContext items={layout.map((p) => p.id)} strategy={undefined}>
        <div className={editing ? "home-grid editing" : "home-grid"}>
          {layout.map((p, i) => (
            <SortableWidget
              key={p.id}
              id={p.id}
              span={p.span}
              label={WIDGET_MAP[p.id]?.label ?? p.id}
              editing={editing}
              onSpan={(s: Span) => onSpan(p.id, s)}
              onRemove={() => onRemove(p.id)}
            >
              <motion.div
                className={classes.fill}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i, 8) * 0.04, duration: 0.3 }}
              >
                {render(p.id)}
              </motion.div>
            </SortableWidget>
          ))}
        </div>
      </SortableContext>

      <DragOverlay dropAnimation={null}>
        {dragging ? <WidgetDragPreview label={WIDGET_MAP[dragging]?.label ?? dragging} /> : null}
      </DragOverlay>
    </DndContext>
  );
}
