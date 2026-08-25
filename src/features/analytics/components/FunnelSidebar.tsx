import { Card, Group, Text, Stack, ActionIcon, Menu, UnstyledButton } from "@mantine/core";
import { Bookmark, Pencil, MoreVertical, Trash2, LayoutList } from "lucide-react";
import type { FunnelStepInput } from "@/shared/types";

type SavedFunnel = { id: string; name: string; steps: FunnelStepInput[] };
type Preset = { key: string; label: string; steps: FunnelStepInput[] };

/** Combined picker for saved funnels and ready-made templates, shown as a
 * left rail next to the builder rather than as separate stacked cards. */
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
    <Stack w={260} gap="md" style={{ flexShrink: 0 }}>
      {savedFunnels.length > 0 && (
        <Card withBorder radius="lg" padding="sm">
          <Group gap={8} mb={6} px={4}>
            <Bookmark size={14} className="sect-ic" />
            <Text fw={600} c="dimmed" size="xs" tt="uppercase">Saved funnels</Text>
          </Group>
          <Stack gap={2}>
            {savedFunnels.map((f) => (
              <Group key={f.id} gap={0} wrap="nowrap">
                <UnstyledButton
                  onClick={() => onLoadSaved(f)}
                  disabled={disabled}
                  style={{
                    flex: 1,
                    minWidth: 0,
                    borderRadius: 8,
                    padding: "7px 10px",
                    background: editingId === f.id ? "var(--mantine-color-grape-light)" : "transparent",
                    color: editingId === f.id ? "var(--mantine-color-grape-6)" : undefined,
                    fontWeight: editingId === f.id ? 600 : 500,
                    fontSize: 13,
                    transition: "background 100ms ease",
                  }}
                >
                  <Text size="sm" truncate fw="inherit" c="inherit">{f.name}</Text>
                </UnstyledButton>
                <Menu withinPortal position="bottom-end">
                  <Menu.Target>
                    <ActionIcon variant="subtle" color="gray" size="sm">
                      <MoreVertical size={13} />
                    </ActionIcon>
                  </Menu.Target>
                  <Menu.Dropdown>
                    <Menu.Item leftSection={<Pencil size={13} />} onClick={() => onLoadSaved(f)}>
                      Load &amp; edit
                    </Menu.Item>
                    <Menu.Item
                      leftSection={<Trash2 size={13} />}
                      color="red"
                      onClick={() => onRemoveSaved(f.id)}
                    >
                      Delete
                    </Menu.Item>
                  </Menu.Dropdown>
                </Menu>
              </Group>
            ))}
          </Stack>
        </Card>
      )}

      {presets.length > 0 && (
        <Card withBorder radius="lg" padding="sm">
          <Group gap={8} mb={6} px={4}>
            <LayoutList size={14} className="sect-ic" />
            <Text fw={600} c="dimmed" size="xs" tt="uppercase">Templates</Text>
          </Group>
          <Stack gap={2}>
            {presets.map((p) => (
              <UnstyledButton
                key={p.key}
                onClick={() => onRunPreset(p)}
                disabled={disabled}
                style={{
                  borderRadius: 8,
                  padding: "7px 10px",
                  background: activePreset === p.key ? "var(--mantine-color-emerald-light)" : "transparent",
                  color: activePreset === p.key ? "var(--mantine-color-emerald-6)" : undefined,
                  fontWeight: activePreset === p.key ? 600 : 500,
                  fontSize: 13,
                  transition: "background 100ms ease",
                }}
              >
                <Text size="sm" truncate fw="inherit" c="inherit">{p.label}</Text>
              </UnstyledButton>
            ))}
          </Stack>
        </Card>
      )}
    </Stack>
  );
}
