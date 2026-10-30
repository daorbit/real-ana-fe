import { useState } from "react";
import {
  Group, Text, Button, Menu, Modal, TextInput, Stack, ActionIcon, Tooltip,
  type MantineSpacing,
} from "@mantine/core";
import { Filter, Bookmark, BookmarkPlus, Trash2, Pin, ChevronDown } from "lucide-react";
import type { StatsFilter, Segment } from "@/shared/types";
import { Chip } from "@/shared/ui/Chip";
import styles from "./FilterBar.module.css";

/** Human labels for each filterable dimension. */
const LABELS: Record<keyof StatsFilter, string> = {
  country: "Country",
  device: "Device",
  browser: "Browser",
  os: "OS",
  referrer: "Referrer",
  path: "Page",
  language: "Language",
  utmSource: "UTM source",
  utmMedium: "UTM medium",
  utmCampaign: "UTM campaign",
  eventName: "Event",
};

/** A one-line description of a segment's filter, for menu rows and tooltips. */
function describe(filter: StatsFilter): string {
  return (Object.entries(filter) as [keyof StatsFilter, string][])
    .filter(([, v]) => v)
    .map(([k, v]) => `${LABELS[k]}: ${v}`)
    .join(" · ");
}

/** Whether two filters select the same thing, so an applied segment can be marked active. */
function sameFilter(a: StatsFilter, b: StatsFilter): boolean {
  const clean = (f: StatsFilter) =>
    Object.entries(f)
      .filter(([, v]) => v)
      .sort(([x], [y]) => x.localeCompare(y))
      .map(([k, v]) => `${k}:${v}`)
      .join("|");
  return clean(a) === clean(b);
}

/**
 * The strip above the dashboard: saved segments, then the filters currently
 * applied.
 *
 * Saving lives here rather than in its own panel because a segment *is* a
 * filter — the moment someone wants to keep one is the moment they are looking
 * at it, and making them go elsewhere to save it is how a feature goes unused.
 */
export function FilterBar({
  filter,
  onRemove,
  onClear,
  segments = [],
  onApplySegment,
  onSaveSegment,
  onDeleteSegment,
  onTogglePin,
  saving = false,
  busyId = null,
  mb = "lg",
}: {
  mb?: MantineSpacing | number;
  filter: StatsFilter;
  onRemove: (key: keyof StatsFilter) => void;
  onClear: () => void;
  /** Saved segments for this workspace. Omitted in contexts that can't save. */
  segments?: Segment[];
  onApplySegment?: (segment: Segment) => void;
  /** Awaited, so the dialog can hold its spinner until the save resolves. */
  onSaveSegment?: (name: string, filter: StatsFilter) => void | Promise<void>;
  onDeleteSegment?: (segment: Segment) => void;
  onTogglePin?: (segment: Segment) => void;
  saving?: boolean;
  /**
   * The segment currently being pinned or deleted.
   *
   * Per-row rather than a single flag, so the spinner appears on the row that
   * was clicked instead of on all of them.
   */
  busyId?: string | null;
}) {
  const [naming, setNaming] = useState(false);
  const [name, setName] = useState("");

  const entries = Object.entries(filter).filter(([, v]) => v) as [
    keyof StatsFilter,
    string,
  ][];

  const hasFilter = entries.length > 0;
  const pinned = segments.filter((s) => s.pinned);
  const canSave = hasFilter && Boolean(onSaveSegment);

  // Already saved under some name — offer nothing rather than inviting a
  // duplicate of the view the user is looking at.
  const alreadySaved = segments.some((s) => sameFilter(s.filter, filter));

  const submit = async () => {
    const trimmed = name.trim();
    if (!trimmed || !onSaveSegment || saving) return;

    // Awaited so the dialog stays open — with its button spinning — until the
    // save lands. Closing first would make a failure look like a success.
    await onSaveSegment(trimmed, filter);
    setName("");
    setNaming(false);
  };

  // Nothing to show at all: no filter applied and nothing saved to apply.
  if (!hasFilter && !segments.length) return null;

  return (
    <>
      <Group gap={8} mb={mb} wrap="wrap" className={styles.bar}>
        {segments.length > 0 && (
          <>
            <span className={styles.label}>
              <Bookmark size={13} />
              Segments
            </span>

            {/* Pinned segments are one click; the rest sit behind the menu.
                A saved view is only a shortcut if the daily ones are reachable
                without opening anything. */}
            {pinned.map((segment) => (
              <Chip
                key={segment.id}
                active={sameFilter(segment.filter, filter)}
                title={describe(segment.filter)}
                onClick={() => onApplySegment?.(segment)}
              >
                {segment.name}
              </Chip>
            ))}

            <Menu shadow="md" position="bottom-start" radius="md" width={280}>
              <Menu.Target>
                <Button
                  variant="subtle"
                  color="gray"
                  size="compact-sm"
                  rightSection={<ChevronDown size={13} />}
                >
                  All ({segments.length})
                </Button>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Label>Saved segments</Menu.Label>
                {segments.map((segment) => (
                  <Menu.Item
                    key={segment.id}
                    onClick={() => onApplySegment?.(segment)}
                    rightSection={
                      <Group gap={2} wrap="nowrap" onClick={(e) => e.stopPropagation()}>
                        {onTogglePin && (
                          <Tooltip label={segment.pinned ? "Unpin" : "Pin"}>
                            <ActionIcon
                              variant="subtle"
                              color={segment.pinned ? "emerald" : "gray"}
                              size="sm"
                              loading={busyId === segment.id}
                              disabled={Boolean(busyId) && busyId !== segment.id}
                              onClick={() => onTogglePin(segment)}
                              aria-label={segment.pinned ? "Unpin" : "Pin"}
                            >
                              <Pin size={12} />
                            </ActionIcon>
                          </Tooltip>
                        )}
                        {onDeleteSegment && (
                          <Tooltip label="Delete">
                            <ActionIcon
                              variant="subtle"
                              color="gray"
                              size="sm"
                              loading={busyId === segment.id}
                              disabled={Boolean(busyId) && busyId !== segment.id}
                              onClick={() => onDeleteSegment(segment)}
                              aria-label="Delete"
                            >
                              <Trash2 size={12} />
                            </ActionIcon>
                          </Tooltip>
                        )}
                      </Group>
                    }
                  >
                    <Text size="sm" fw={550}>{segment.name}</Text>
                    <Text size="xs" c="dimmed" lineClamp={1}>
                      {describe(segment.filter)}
                    </Text>
                  </Menu.Item>
                ))}
              </Menu.Dropdown>
            </Menu>
          </>
        )}

        {hasFilter && (
          <>
            <span className={styles.label} data-spaced={segments.length > 0 || undefined}>
              <Filter size={13} />
              Filtered by
            </span>

            {entries.map(([key, value]) => (
              <Chip key={key} active removable title="Remove filter" onClick={() => onRemove(key)}>
                <span className={styles.key}>{LABELS[key]}</span>
                <span className={styles.value}>{value}</span>
              </Chip>
            ))}

            {canSave && !alreadySaved && (
              <Button
                variant="subtle"
                color="emerald"
                size="compact-sm"
                leftSection={<BookmarkPlus size={13} />}
                loading={saving}
                onClick={() => setNaming(true)}
              >
                Save segment
              </Button>
            )}

            <Button variant="subtle" color="gray" size="compact-sm" onClick={onClear}>
              Clear all
            </Button>
          </>
        )}
      </Group>

      <Modal
        opened={naming}
        onClose={() => setNaming(false)}
        title={<Text fw={700}>Save this segment</Text>}
        centered
        radius="lg"
        size="sm"
      >
        <Stack gap="md">
          <div>
            <Text size="sm" c="dimmed" mb={6}>
              You&apos;re saving:
            </Text>
            <Text size="sm" fw={550}>{describe(filter)}</Text>
          </div>

          <TextInput
            label="Name"
            placeholder="Mobile — India"
            value={name}
            onChange={(e) => setName(e.currentTarget.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            maxLength={60}
            data-autofocus
          />

          <Group justify="flex-end">
            <Button variant="subtle" color="gray" onClick={() => setNaming(false)}>
              Cancel
            </Button>
            <Button color="emerald" disabled={!name.trim()} loading={saving} onClick={submit}>
              Save
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
}
