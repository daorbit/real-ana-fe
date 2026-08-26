import { Menu, Button, Checkbox, Stack, Group, Text, Divider, ScrollArea } from "@mantine/core";
import { Globe, ChevronDown } from "lucide-react";
import type { Site } from "@/shared/types";

 
export function SiteFilter({
  sites,
  selected,
  onChange,
}: {
  sites: Site[];
  /** siteIds in scope; empty means every site. */
  selected: string[];
  onChange: (next: string[]) => void;
}) {
  // Nothing to choose between with a single site — showing a picker would just
  // be a dead control.
  if (sites.length < 2) return null;

  const set = new Set(selected);
  const allSelected = selected.length === 0;

  const toggle = (siteId: string) => {
    // "All" is stored as an empty list, but every row renders checked in that
    // state — so a click there means "deselect this one from all of them",
    // which has to start from the full list rather than from the empty one
    // it is actually stored as. Without this, the first click on a checked
    // row deleted from an empty set and silently did nothing.
    const base = allSelected ? new Set(sites.map((s) => s.siteId)) : new Set(set);

    if (base.has(siteId)) base.delete(siteId);
    else base.add(siteId);

    // Selecting every site collapses back to the "all" default, so the two
    // states never disagree.
    onChange(base.size === sites.length ? [] : [...base]);
  };

  const label = allSelected
    ? "All sites"
    : selected.length === 1
    ? sites.find((s) => s.siteId === selected[0])?.name ?? "1 site"
    : `${selected.length} sites`;

  return (
    <Menu shadow="md" width={260} position="bottom-end" closeOnItemClick={false} radius="md">
      <Menu.Target>
        <Button
          size="sm"
          variant="default"
          leftSection={<Globe size={15} />}
          rightSection={<ChevronDown size={14} />}
        >
          {label}
        </Button>
      </Menu.Target>

      <Menu.Dropdown>
        <Group justify="space-between" px="xs" py={6}>
          <Text size="xs" fw={600} c="dimmed">Sites</Text>
          {!allSelected && (
            <Text
              size="xs"
              c="emerald"
              style={{ cursor: "pointer" }}
              onClick={() => onChange([])}
            >
              Select all
            </Text>
          )}
        </Group>
        <Divider />
        <ScrollArea.Autosize mah={280}>
          <Stack gap={0} py={4}>
            {sites.map((s) => {
              const checked = allSelected || set.has(s.siteId);
              return (
                <Group
                  key={s.siteId}
                  gap="sm"
                  wrap="nowrap"
                  px="xs"
                  py={7}
                  style={{ cursor: "pointer", borderRadius: 6 }}
                  onClick={() => toggle(s.siteId)}
                  className="site-filter-row"
                >
                  <Checkbox
                    size="xs"
                    color="emerald"
                    checked={checked}
                    readOnly
                    tabIndex={-1}
                    styles={{ input: { cursor: "pointer" } }}
                  />
                  <div style={{ minWidth: 0 }}>
                    <Text size="sm" truncate>{s.name}</Text>
                    <Text size="xs" c="dimmed" truncate>{s.domain}</Text>
                  </div>
                </Group>
              );
            })}
          </Stack>
        </ScrollArea.Autosize>
      </Menu.Dropdown>
    </Menu>
  );
}
