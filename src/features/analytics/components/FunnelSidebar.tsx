import { ActionIcon, Menu } from "@mantine/core";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { stepCountLabel } from "@/features/analytics/components/funnel/funnelStats";
import classes from "@/features/analytics/components/funnel/Funnel.module.css";
import type { FunnelStepInput } from "@/shared/types";

type SavedFunnel = { id: string; name: string; steps: FunnelStepInput[] };
type Preset = { key: string; label: string; steps: FunnelStepInput[] };

function stepPath(steps: FunnelStepInput[]): string {
  return steps.map((s) => s.value).join(" → ");
}

export function FunnelSidebar({
  savedFunnels,
  presets,
  editingId,
  activePreset,
  disabled,
  onLoadSaved,
  onRemoveSaved,
  onRunPreset,
}: {
  savedFunnels: SavedFunnel[];
  presets: Preset[];
  editingId: string | null;
  activePreset: string | null;
  disabled: boolean;
  onLoadSaved: (f: SavedFunnel) => void;
  onRemoveSaved: (funnelId: string) => void;
  onRunPreset: (p: Preset) => void;
}) {
  if (savedFunnels.length === 0 && presets.length === 0) return null;

  return (
    <aside className={`${classes.panel} ${classes.rail}`} aria-label="Funnels">
      {savedFunnels.length > 0 && (
        <div className={classes.railGroup}>
          <span className={classes.railTitle}>Saved</span>
          {savedFunnels.map((f) => (
            <div key={f.id} className={classes.railRow}>
              <button
                type="button"
                className={classes.railItem}
                data-active={editingId === f.id || undefined}
                onClick={() => onLoadSaved(f)}
                disabled={disabled}
                title={stepPath(f.steps)}
              >
                <span className={classes.railName}>{f.name}</span>
                <span className={classes.railMeta}>{stepCountLabel(f.steps.length)}</span>
              </button>
              <Menu withinPortal position="bottom-end">
                <Menu.Target>
                  <ActionIcon variant="subtle" color="gray" radius="xl" size="sm" aria-label={`Actions for ${f.name}`}>
                    <MoreHorizontal size={14} />
                  </ActionIcon>
                </Menu.Target>
                <Menu.Dropdown>
                  <Menu.Item leftSection={<Pencil size={13} />} onClick={() => onLoadSaved(f)}>
                    Open and edit
                  </Menu.Item>
                  <Menu.Item leftSection={<Trash2 size={13} />} color="red" onClick={() => onRemoveSaved(f.id)}>
                    Delete
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            </div>
          ))}
        </div>
      )}

      {presets.length > 0 && (
        <div className={classes.railGroup}>
          <span className={classes.railTitle}>Suggested</span>
          {presets.map((p) => (
            <button
              key={p.key}
              type="button"
              className={classes.railItem}
              data-active={activePreset === p.key || undefined}
              onClick={() => onRunPreset(p)}
              disabled={disabled}
              title={stepPath(p.steps)}
            >
              <span className={classes.railName}>{p.label}</span>
              <span className={classes.railMeta}>{stepCountLabel(p.steps.length)}</span>
            </button>
          ))}
        </div>
      )}
    </aside>
  );
}
