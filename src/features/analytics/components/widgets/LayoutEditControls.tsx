import { Button, Menu } from "@mantine/core";
import { Check, ChevronDown, Pencil, Plus, SlidersHorizontal } from "lucide-react";

export function LayoutEditControls({
  editing,
  dirty,
  saving,
  onToggleEdit,
  onDiscard,
  onSave,
  onAdd,
}: {
  editing: boolean;
  dirty: boolean;
  saving: boolean;
  onToggleEdit: () => void;
  onDiscard: () => void;
  onSave: () => void;
  onAdd: () => void;
}) {
  if (!editing && !dirty) {
    return (
      <Menu position="bottom-end" withinPortal shadow="md" width={200}>
        <Menu.Target>
          <Button
            variant="default"
            leftSection={<SlidersHorizontal size={15} />}
            rightSection={<ChevronDown size={14} />}
          >
            Customize
          </Button>
        </Menu.Target>
        <Menu.Dropdown>
          <Menu.Item leftSection={<Pencil size={14} />} onClick={onToggleEdit}>
            Edit layout
          </Menu.Item>
          <Menu.Item leftSection={<Plus size={14} />} onClick={onAdd}>
            Add widgets
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>
    );
  }

  return (
    <>
      {dirty ? (
        <>
          <Button variant="subtle" color="gray" onClick={onDiscard} disabled={saving}>
            Discard
          </Button>
          <Button color="emerald" leftSection={<Check size={15} />} onClick={onSave} loading={saving}>
            Save changes
          </Button>
        </>
      ) : (
        <Button color="emerald" leftSection={<Check size={15} />} onClick={onToggleEdit}>
          Done
        </Button>
      )}
      <Button variant="default" leftSection={<Plus size={15} />} onClick={onAdd}>
        Add widgets
      </Button>
    </>
  );
}
