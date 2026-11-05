import { Button, Menu } from "@mantine/core";
import { DndContext, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, arrayMove, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Plus } from "lucide-react";
import { ADDABLE_BLOCKS, BLOCK_INFO } from "@/features/campaigns/lib/emailDesign";
import type { EmailBlock, EmailBlockType } from "@/features/campaigns/types";
import { BlockRow } from "./BlockRow";
import { EditorSection } from "./EditorSection";

interface Props {
  blocks: EmailBlock[];
  expandedId: string | null;
  onExpand: (id: string | null) => void;
  onReorder: (updater: (blocks: EmailBlock[]) => EmailBlock[]) => void;
  onChange: (id: string, patch: Partial<EmailBlock>) => void;
  onAdd: (type: EmailBlockType) => void;
  onDuplicate: (id: string) => void;
  onRemove: (id: string) => void;
}

export function BlockList({ blocks, expandedId, onExpand, onReorder, onChange, onAdd, onDuplicate, onRemove }: Props) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    onReorder((current) => {
      const from = current.findIndex((block) => block.id === active.id);
      const to = current.findIndex((block) => block.id === over.id);
      return arrayMove(current, from, to);
    });
  };

  const addMenu = (
    <Menu position="bottom-end" withinPortal>
      <Menu.Target>
        <Button variant="subtle" size="compact-sm" leftSection={<Plus size={14} />}>Add</Button>
      </Menu.Target>
      <Menu.Dropdown>
        {ADDABLE_BLOCKS.map((type) => {
          const info = BLOCK_INFO[type];
          const Icon = info.icon;
          return (
            <Menu.Item key={type} leftSection={<Icon size={15} />} onClick={() => onAdd(type)}>
              {info.label}
            </Menu.Item>
          );
        })}
      </Menu.Dropdown>
    </Menu>
  );

  return (
    <EditorSection title="Content" aside={addMenu} note="Drag to reorder. Open a row to edit it.">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={blocks.map((block) => block.id)} strategy={verticalListSortingStrategy}>
          {blocks.map((block) => (
            <BlockRow
              key={block.id}
              block={block}
              expanded={expandedId === block.id}
              onToggle={() => onExpand(expandedId === block.id ? null : block.id)}
              onChange={(patch) => onChange(block.id, patch)}
              onDuplicate={() => onDuplicate(block.id)}
              onRemove={() => onRemove(block.id)}
            />
          ))}
        </SortableContext>
      </DndContext>
    </EditorSection>
  );
}
