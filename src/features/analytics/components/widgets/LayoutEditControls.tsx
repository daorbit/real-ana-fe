import { Button, Menu } from "@mantine/core";
import { Check, ChevronDown, LayoutTemplate, Pencil, Plus, SlidersHorizontal } from "lucide-react";
import { LAYOUT_PRESETS, type LayoutPreset } from "@/features/analytics/homeLayoutPresets";
import { setHomeDisplay, useHomeDisplay } from "@/features/analytics/homeDisplayPrefs";
import classes from "./Widgets.module.css";

function PresetItems({ onPreset }: { onPreset: (preset: LayoutPreset) => void }) {
  return LAYOUT_PRESETS.map((p) => (
    <Menu.Item key={p.id} onClick={() => onPreset(p)}>
      <span className={classes.presetLabel}>{p.label}</span>
      <span className={classes.presetHint}>{p.description}</span>
    </Menu.Item>
  ));
}

function PresetMenu({ onPreset }: { onPreset: (preset: LayoutPreset) => void }) {
  return (
    <Menu.Sub>
      <Menu.Sub.Target>
        <Menu.Sub.Item leftSection={<LayoutTemplate size={14} />}>Start from a preset</Menu.Sub.Item>
      </Menu.Sub.Target>
      <Menu.Sub.Dropdown>
        <PresetItems onPreset={onPreset} />
      </Menu.Sub.Dropdown>
    </Menu.Sub>
  );
}

export function LayoutEditControls({
  editing,
  dirty,
  saving,
  onToggleEdit,
  onDiscard,
  onSave,
  onAdd,
  onPreset,
}: {
  editing: boolean;
  dirty: boolean;
  saving: boolean;
  onToggleEdit: () => void;
  onDiscard: () => void;
  onSave: () => void;
  onAdd: () => void;
  onPreset: (preset: LayoutPreset) => void;
}) {
  const display = useHomeDisplay();

  if (!editing && !dirty) {
    return (
      <Menu position="bottom-end" withinPortal shadow="md" width={240}>
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
          <PresetMenu onPreset={onPreset} />
          <Menu.Divider />
          <Menu.Label>Show on Home</Menu.Label>
          <Menu.Item
            closeMenuOnClick={false}
            leftSection={display.greeting ? <Check size={14} /> : <span className={classes.checkSpacer} />}
            onClick={() => setHomeDisplay({ greeting: !display.greeting })}
          >
            Greeting
          </Menu.Item>
          <Menu.Item
            closeMenuOnClick={false}
            leftSection={display.hero ? <Check size={14} /> : <span className={classes.checkSpacer} />}
            onClick={() => setHomeDisplay({ hero: !display.hero })}
          >
            Summary banner
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
      <Menu position="bottom-end" withinPortal shadow="md" width={240}>
        <Menu.Target>
          <Button variant="default" leftSection={<LayoutTemplate size={15} />} rightSection={<ChevronDown size={14} />}>
            Presets
          </Button>
        </Menu.Target>
        <Menu.Dropdown>
          <PresetItems onPreset={onPreset} />
        </Menu.Dropdown>
      </Menu>
      <Button variant="default" leftSection={<Plus size={15} />} onClick={onAdd}>
        Add widgets
      </Button>
    </>
  );
}
