import { useState } from "react";
import {
  Modal, Stack, TextInput, Textarea, Select, Button, Group, Text, ActionIcon,
  Tooltip, ScrollArea, Badge,
} from "@mantine/core";
import { ReferenceLine, Label } from "recharts";
import { Flag, Trash2, Plus } from "lucide-react";
import type { Marker, MarkerKind, Point } from "@/shared/types";

/**
 * How each kind of marker reads on the chart.
 *
 * Incidents are red because they are the one kind you want to spot without
 * reading; the rest are muted so a busy release month doesn't bury the data
 * under its own annotations.
 */
const KIND_STYLE: Record<MarkerKind, { color: string; glyph: string }> = {
  deploy: { color: "#8b5cf6", glyph: "▲" },
  campaign: { color: "#0ea5e9", glyph: "◆" },
  incident: { color: "#ef4444", glyph: "!" },
  note: { color: "#94a3b8", glyph: "•" },
};

/**
 * Format a timestamp into the bucket key the server groups by.
 *
 * The series' x-axis is a string — `"14:00"` for windows up to 24h, `"08-05"`
 * beyond — produced by Mongo's `$dateToString`. A `ReferenceLine` has to name
 * an existing category exactly or Recharts silently drops it, so this mirrors
 * that formatting rather than working in real time.
 *
 * Mongo formats in UTC, so these must too: using local time would slide every
 * marker by the viewer's offset and put a deploy on the wrong bar.
 */
function bucketKeyFor(at: Date, hourly: boolean): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return hourly
    ? `${pad(at.getUTCHours())}:00`
    : `${pad(at.getUTCMonth() + 1)}-${pad(at.getUTCDate())}`;
}

/**
 * Vertical lines over the trend chart, one per marker.
 *
 * Returns an array of `ReferenceLine` elements rather than a wrapping
 * component: Recharts only honours children it recognises, so anything that
 * renders a `<div>` around them would be ignored. The caller spreads the
 * result into `<AreaChart>` directly.
 *
 * Markers outside the rendered series are dropped — a line pointing at a
 * bucket the chart doesn't have would be drawn at the axis edge, which reads
 * as "this happened at the start of the window" and is a lie.
 */
export function markerLines(markers: Marker[], series: Point[], hourly: boolean) {
  if (!markers.length || !series.length) return [];

  const present = new Set(series.map((b) => b.bucket));

  // Several deploys can land in one bucket, and stacking their labels would
  // make an unreadable pile. Keep one line per bucket and let its label say
  // how many.
  const byBucket = new Map<string, Marker[]>();

  for (const marker of markers) {
    const at = new Date(marker.at);
    if (Number.isNaN(at.getTime())) continue;

    const key = bucketKeyFor(at, hourly);
    if (!present.has(key)) continue;

    byBucket.set(key, [...(byBucket.get(key) ?? []), marker]);
  }

  return [...byBucket.entries()].map(([bucket, group]) => {
    // The most severe kind in the bucket decides the colour — an incident
    // sharing a bucket with a routine deploy must not be drawn as routine.
    const kind: MarkerKind = group.some((m) => m.kind === "incident")
      ? "incident"
      : (group[0].kind as MarkerKind);
    const style = KIND_STYLE[kind] ?? KIND_STYLE.note;

    const label =
      group.length === 1
        ? group[0].label
        : `${group.length} events`;

    return (
      <ReferenceLine
        key={bucket}
        x={bucket}
        stroke={style.color}
        strokeWidth={1.5}
        strokeDasharray="4 3"
        // Behind the areas, so an annotation never obscures the data it is
        // annotating.
        ifOverflow="extendDomain"
      >
        <Label
          value={`${style.glyph} ${label}`}
          position="top"
          fill={style.color}
          fontSize={10}
          fontWeight={600}
          // Nudged up so the glyph clears the plot area rather than sitting on
          // the topmost gridline.
          offset={8}
        />
      </ReferenceLine>
    );
  });
}

/** Turn a Date into the value a `datetime-local` input expects, in local time. */
function toLocalInput(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/**
 * Add a marker, and manage the ones already on the chart.
 *
 * A dialog rather than an inline form: adding a deploy is occasional, and the
 * chart header has no room for a form that is usually idle. The existing
 * markers are listed in the same place because "what did I already annotate"
 * and "add another" are the same visit.
 */
export function MarkerDialog({
  opened,
  onClose,
  markers,
  onSave,
  onDelete,
  saving = false,
  deletingId = null,
}: {
  opened: boolean;
  onClose: () => void;
  markers: Marker[];
  /**
   * Awaited, so the form holds its input until the save resolves.
   *
   * Null for a viewer: the dialog becomes a read-only list of what is on the
   * chart, with no add form.
   */
  onSave:
    | ((input: {
        label: string;
        description: string;
        kind: MarkerKind;
        at: string;
      }) => void | Promise<void>)
    | null;
  /** Null for a viewer, who may read markers but not remove them. */
  onDelete: ((marker: Marker) => void) | null;
  saving?: boolean;
  /**
   * The marker currently being deleted, if any.
   *
   * Per-row rather than a single boolean: with several markers listed, a
   * global spinner can't say *which* one is going, and the row the user
   * clicked is the one they are watching.
   */
  deletingId?: string | null;
}) {
  const [label, setLabel] = useState("");
  const [description, setDescription] = useState("");
  const [kind, setKind] = useState<MarkerKind>("deploy");
  // Defaults to now, which is what someone recording a deploy they just made
  // wants; editable for backfilling one that already happened.
  const [at, setAt] = useState(() => toLocalInput(new Date()));

  const submit = async () => {
    const trimmed = label.trim();
    if (!trimmed || saving || !onSave) return;

    // Awaited so the form only clears once the marker is actually stored —
    // clearing first would discard what the user typed if the save failed.
    await onSave({
      label: trimmed,
      description: description.trim(),
      kind,
      // The input is local time; the API takes an instant.
      at: new Date(at).toISOString(),
    });

    setLabel("");
    setDescription("");
    setAt(toLocalInput(new Date()));
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={<Text fw={700}>Timeline markers</Text>}
      centered
      radius="lg"
      size="lg"
    >
      <Stack gap="lg">
        {onSave && (
          <Stack gap="sm">
            <Group grow align="flex-start">
              <TextInput
                label="Label"
                placeholder="v2.4.0"
                value={label}
                onChange={(e) => setLabel(e.currentTarget.value)}
                onKeyDown={(e) => e.key === "Enter" && submit()}
                maxLength={80}
                data-autofocus
              />
              <Select
                label="Kind"
                value={kind}
                onChange={(v) => v && setKind(v as MarkerKind)}
                data={[
                  { value: "deploy", label: "Deploy" },
                  { value: "campaign", label: "Campaign" },
                  { value: "incident", label: "Incident" },
                  { value: "note", label: "Note" },
                ]}
                allowDeselect={false}
              />
            </Group>

            <TextInput
              label="When"
              type="datetime-local"
              value={at}
              onChange={(e) => setAt(e.currentTarget.value)}
            />

            <Textarea
              label="Notes"
              placeholder="Commit sha, release notes, a link — anything that explains it later."
              value={description}
              onChange={(e) => setDescription(e.currentTarget.value)}
              maxLength={500}
              autosize
              minRows={2}
              maxRows={4}
            />

            <Group justify="flex-end">
              <Button
                color="emerald"
                leftSection={<Plus size={15} />}
                disabled={!label.trim()}
                loading={saving}
                onClick={submit}
              >
                Add marker
              </Button>
            </Group>
          </Stack>
        )}

        {markers.length > 0 && (
          <div>
            <Text size="xs" fw={700} c="dimmed" tt="uppercase" mb="xs" style={{ letterSpacing: "0.05em" }}>
              On this chart
            </Text>
            <ScrollArea.Autosize mah={220}>
              <Stack gap={6}>
                {markers.map((marker) => {
                  const style = KIND_STYLE[marker.kind] ?? KIND_STYLE.note;
                  return (
                    <Group
                      key={marker.id}
                      justify="space-between"
                      wrap="nowrap"
                      style={{
                        padding: "8px 10px",
                        border: "1px solid var(--border)",
                        borderRadius: 8,
                      }}
                    >
                      <Group gap={10} wrap="nowrap" style={{ minWidth: 0 }}>
                        <Badge
                          size="sm"
                          radius="sm"
                          variant="light"
                          tt="none"
                          style={{ color: style.color, background: `${style.color}1a` }}
                        >
                          {style.glyph} {marker.kind}
                        </Badge>
                        <div style={{ minWidth: 0 }}>
                          <Text size="sm" fw={600} truncate>{marker.label}</Text>
                          <Text size="xs" c="dimmed">
                            {new Date(marker.at).toLocaleString(undefined, {
                              day: "numeric",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </Text>
                        </div>
                      </Group>
                      {onDelete && (
                        <Tooltip label="Delete">
                          <ActionIcon
                            variant="subtle"
                            color="gray"
                            loading={deletingId === marker.id}
                            // Deleting one row disables the others: two
                            // overlapping deletes would leave the list
                            // reordering under the cursor.
                            disabled={Boolean(deletingId) && deletingId !== marker.id}
                            onClick={() => onDelete(marker)}
                          >
                            <Trash2 size={14} />
                          </ActionIcon>
                        </Tooltip>
                      )}
                    </Group>
                  );
                })}
              </Stack>
            </ScrollArea.Autosize>
          </div>
        )}

        <Text size="xs" c="dimmed">
          Markers can also be posted from CI over the Platform API, so every
          deploy annotates itself — see <b>POST /v1/markers</b> in the docs.
        </Text>
      </Stack>
    </Modal>
  );
}

/** The button that opens the dialog, for the chart header. */
export function MarkerButton({ onClick, count }: { onClick: () => void; count: number }) {
  return (
    <Tooltip label={count ? `${count} marker${count === 1 ? "" : "s"} on this range` : "Add a deploy or campaign marker"}>
      <ActionIcon variant="subtle" color="gray" size="sm" onClick={onClick}>
        <Flag size={14} />
      </ActionIcon>
    </Tooltip>
  );
}

/** Legend explaining the marker colours, shown only when markers exist. */
export function MarkerLegend({ markers }: { markers: Marker[] }) {
  if (!markers.length) return null;

  const kinds = [...new Set(markers.map((m) => m.kind))] as MarkerKind[];

  return (
    <>
      {kinds.map((kind) => {
        const style = KIND_STYLE[kind] ?? KIND_STYLE.note;
        return (
          <span
            key={kind}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              fontSize: 11,
              color: "var(--muted)",
              textTransform: "capitalize",
            }}
          >
            <span style={{ color: style.color }}>{style.glyph}</span>
            {kind}
          </span>
        );
      })}
    </>
  );
}
