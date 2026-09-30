import { Button } from "@mantine/core";
import { Check, Pencil, SlidersHorizontal } from "lucide-react";

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
        <Button
          variant={editing ? "filled" : "default"}
          color={editing ? "emerald" : undefined}
          leftSection={editing ? <Check size={15} /> : <Pencil size={15} />}
          onClick={onToggleEdit}
        >
          {editing ? "Done" : "Edit layout"}
        </Button>
      )}
      <Button variant="default" leftSection={<SlidersHorizontal size={15} />} onClick={onAdd}>
        Add widgets
      </Button>
    </>
  );
}
