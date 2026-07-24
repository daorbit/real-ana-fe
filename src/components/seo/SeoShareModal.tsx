import {
  Modal, Stack, Group, Text, Switch, Badge, TextInput, CopyButton, Button,
  Tooltip, ActionIcon, Divider, Box, Checkbox, SimpleGrid, ThemeIcon, Skeleton,
  Alert,
} from "@mantine/core";
import {
  Copy, Check, RefreshCw, ExternalLink, Eye, ShieldCheck, Share2,
} from "lucide-react";
import { useGetSeoShareQuery, useSetSeoShareMutation } from "../../store";
import { notify, errMessage, confirmDelete } from "../../notify";
import { num, timeAgo } from "../../utils";
import type { SeoSharePanels } from "../../types";

type PanelDef = { key: keyof SeoSharePanels; label: string; hint: string };

/**
 * Sections grouped the way an owner reasons about them, not the order they
 * happen to render. The note on the sensitive group is deliberate: page content
 * and full link lists are where an internal URL slips out.
 */
const PANEL_GROUPS: { heading: string; note?: string; panels: PanelDef[] }[] = [
  {
    heading: "Summary",
    panels: [
      { key: "summary", label: "Score & Lighthouse", hint: "Overall score and category rings" },
      { key: "issues", label: "Issues", hint: "What the audit flagged" },
      { key: "technical", label: "Technical checks", hint: "HTTPS, viewport, crawler files" },
      { key: "performance", label: "Performance", hint: "Core Web Vitals & opportunities" },
    ],
  },
  {
    heading: "Detail",
    note: "These can carry internal URLs or staging paths — publish them deliberately.",
    panels: [
      { key: "meta", label: "Meta tags", hint: "Title, description, social tags" },
      { key: "content", label: "Content", hint: "Word count, headings, images" },
      { key: "links", label: "Links", hint: "Full link-check results" },
      { key: "schema", label: "Structured data", hint: "JSON-LD validation" },
    ],
  },
];

const ALL_PANELS = PANEL_GROUPS.flatMap((g) => g.panels);

/** Server defaults for a report never configured — the summary group on, detail off. */
const DEFAULT_PANELS: SeoSharePanels = {
  summary: true, issues: true, technical: true, performance: true,
  meta: false, content: false, links: false, schema: false,
};

/**
 * Publish one stored audit at a public, unauthenticated link.
 *
 * The link is the whole credential, so the copy says so plainly and rotating is
 * treated as destructive — it silently breaks any link already sent to a
 * client. What each viewer sees is the owner's call, section by section.
 */
export function SeoShareModal({
  opened,
  onClose,
  workspaceId,
  siteId,
  reportId,
}: {
  opened: boolean;
  onClose: () => void;
  workspaceId: string;
  siteId: string;
  reportId: string;
}) {
  const { data, isLoading } = useGetSeoShareQuery(
    { workspaceId, siteId, reportId },
    { skip: !opened }
  );
  const [setShare, { isLoading: saving }] = useSetSeoShareMutation();

  const enabled = data?.enabled ?? false;
  const token = data?.token ?? null;
  const views = data?.views ?? 0;
  const url = token ? `${window.location.origin}/seo-report/${token}` : "";
  const panels = { ...DEFAULT_PANELS, ...(data?.panels ?? {}) };
  const onCount = ALL_PANELS.filter((p) => panels[p.key]).length;

  const writePanels = async (next: SeoSharePanels) => {
    try {
      await setShare({ workspaceId, siteId, reportId, enabled, panels: next }).unwrap();
    } catch (e) {
      notify.error(errMessage(e, "Could not update what is shared."));
    }
  };

  const togglePanel = (key: keyof SeoSharePanels, next: boolean) =>
    writePanels({ ...panels, [key]: next });

  const setAll = (next: boolean) =>
    writePanels(Object.fromEntries(ALL_PANELS.map((p) => [p.key, next])) as SeoSharePanels);

  const toggle = async (next: boolean) => {
    try {
      await setShare({ workspaceId, siteId, reportId, enabled: next }).unwrap();
      notify.success(
        next ? "Anyone with the link can now view this audit." : "The public link is now off.",
        next ? "Sharing on" : "Sharing off"
      );
    } catch (e) {
      notify.error(errMessage(e, "Could not update sharing."));
    }
  };

  const rotate = () =>
    confirmDelete({
      title: "Generate a new link?",
      confirmLabel: "Generate new link",
      body: "The current link stops working immediately. Anyone you already sent it to will lose access until you send the new one.",
      onConfirm: async () => {
        try {
          await setShare({ workspaceId, siteId, reportId, enabled: true, rotate: true }).unwrap();
          notify.success("A new link has been generated.", "Link replaced");
        } catch (e) {
          notify.error(errMessage(e, "Could not generate a new link."));
        }
      },
    });

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group gap="sm">
          <ThemeIcon size={30} radius="md" variant="light" color="emerald">
            <Share2 size={16} />
          </ThemeIcon>
          <div>
            <Text fw={650} size="sm">Share this audit</Text>
            <Text size="xs" c="dimmed">A read-only public link — no account needed.</Text>
          </div>
        </Group>
      }
      size="lg"
      radius="md"
      centered
    >
      {isLoading ? (
        <Stack gap="md">
          <Skeleton height={54} radius="md" />
          <Skeleton height={120} radius="md" />
        </Stack>
      ) : (
        <Stack gap="lg">
          <Group justify="space-between" wrap="nowrap">
            <div>
              <Text size="sm" fw={550}>Public link</Text>
              <Text size="xs" c="dimmed">
                {enabled
                  ? "Live. Anyone with the link can open this audit."
                  : "Off. The link returns 404 until you turn this on."}
              </Text>
            </div>
            <Group gap="sm" wrap="nowrap">
              {enabled && (
                <Badge size="sm" variant="light" color="emerald" radius="sm">
                  Live
                </Badge>
              )}
              <Switch
                checked={enabled}
                onChange={(e) => toggle(e.currentTarget.checked)}
                color="emerald"
                disabled={saving}
                aria-label="Enable public link"
              />
            </Group>
          </Group>

          {enabled && token && (
            <>
              <Box>
                <Text size="xs" c="dimmed" mb={6}>
                  Treat this like a password — the token is the only credential.
                </Text>
                <Group gap="xs" wrap="nowrap">
                  <TextInput
                    value={url}
                    readOnly
                    size="sm"
                    style={{ flex: 1, minWidth: 0 }}
                    styles={{ input: { fontFamily: "var(--mono, monospace)", fontSize: 13 } }}
                    onFocus={(e) => e.currentTarget.select()}
                    aria-label="Public audit link"
                  />
                  <CopyButton value={url}>
                    {({ copied, copy }) => (
                      <Button
                        size="sm"
                        variant={copied ? "light" : "default"}
                        color={copied ? "emerald" : undefined}
                        onClick={copy}
                        leftSection={copied ? <Check size={14} /> : <Copy size={14} />}
                        style={{ flexShrink: 0 }}
                      >
                        {copied ? "Copied" : "Copy"}
                      </Button>
                    )}
                  </CopyButton>
                  <Tooltip label="Open in a new tab" withArrow>
                    <ActionIcon
                      component="a"
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                      variant="default"
                      size="lg"
                      aria-label="Open public audit"
                    >
                      <ExternalLink size={15} />
                    </ActionIcon>
                  </Tooltip>
                </Group>
              </Box>

              <Divider />

              <Box>
                <Group justify="space-between" mb="sm" wrap="nowrap">
                  <Text size="sm" fw={550}>What visitors can see</Text>
                  <Group gap="xs" wrap="nowrap">
                    <Text size="xs" c="dimmed">{onCount} of {ALL_PANELS.length} on</Text>
                    <Button size="compact-xs" variant="subtle" color="gray"
                      disabled={saving || onCount === ALL_PANELS.length} onClick={() => setAll(true)}>
                      All
                    </Button>
                    <Button size="compact-xs" variant="subtle" color="gray"
                      disabled={saving || onCount === 0} onClick={() => setAll(false)}>
                      None
                    </Button>
                  </Group>
                </Group>

                <Stack gap="md">
                  {PANEL_GROUPS.map((g) => (
                    <Box key={g.heading}>
                      <Text size="xs" fw={650} tt="uppercase" c="dimmed" style={{ letterSpacing: "0.04em" }}>
                        {g.heading}
                      </Text>
                      {g.note && (
                        <Text size="xs" c="dimmed" mt={3}>{g.note}</Text>
                      )}
                      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm" mt="xs">
                        {g.panels.map((p) => (
                          <Checkbox
                            key={p.key}
                            size="sm"
                            color="emerald"
                            label={p.label}
                            description={p.hint}
                            checked={panels[p.key]}
                            disabled={saving}
                            onChange={(e) => togglePanel(p.key, e.currentTarget.checked)}
                          />
                        ))}
                      </SimpleGrid>
                    </Box>
                  ))}
                </Stack>
              </Box>

              <Divider />

              <Group justify="space-between" wrap="nowrap">
                <Group gap="sm" wrap="nowrap">
                  <ThemeIcon variant="light" color="gray" radius="md" size="md">
                    <Eye size={14} />
                  </ThemeIcon>
                  <Text size="xs" c="dimmed">
                    {num(views)} {views === 1 ? "open" : "opens"}
                    {data?.lastViewedAt ? ` · last ${timeAgo(data.lastViewedAt)}` : ""}
                  </Text>
                </Group>
                <Button
                  size="compact-sm"
                  variant="default"
                  leftSection={<RefreshCw size={13} />}
                  onClick={rotate}
                  loading={saving}
                >
                  New link
                </Button>
              </Group>
            </>
          )}

          <Alert variant="light" color="gray" icon={<ShieldCheck size={15} />}>
            <Text size="xs">
              The public page is read-only. Your site key, other audits and
              workspace settings are never shared.
            </Text>
          </Alert>
        </Stack>
      )}
    </Modal>
  );
}
