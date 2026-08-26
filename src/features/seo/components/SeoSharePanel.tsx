import {
  Stack, Group, Text, Switch, Badge, TextInput, CopyButton, Button,
  Tooltip, ActionIcon, Divider, Box, Checkbox, SimpleGrid, ThemeIcon, Skeleton,
} from "@mantine/core";
import { useState } from "react";
import { Copy, Check, RefreshCw, ExternalLink, Eye } from "lucide-react";
import { useGetSeoShareQuery, useSetSeoShareMutation } from "@/app/store";
import { notify, errMessage, confirmDelete } from "@/shared/lib/notify";
import { trace } from "@/shared/lib/analytics";
import { useAuth } from "@/features/auth/context";
import { num, timeAgo } from "@/shared/lib";
import { useSaveRegistration } from "@/shared/ui/SaveBar";
import type { SeoSharePanels } from "@/shared/types";

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
      { key: "aiSearch", label: "AI search", hint: "Answer-engine access and readiness" },
    ],
  },
];

const ALL_PANELS = PANEL_GROUPS.flatMap((g) => g.panels);

/** Server defaults for a report never configured — the summary group on, detail off. */
const DEFAULT_PANELS: SeoSharePanels = {
  summary: true, issues: true, technical: true, performance: true,
  meta: false, content: false, links: false, schema: false, aiSearch: false,
};

/**
 * The share controls for one stored audit, rendered inline (no modal chrome).
 *
 * Lives inside the Public dashboard page's SEO tab, one instance per audited
 * page. The link is the whole credential, so the copy says so plainly and
 * rotating is treated as destructive — it silently breaks any link already sent
 * to a client. What each viewer sees is the owner's call, section by section.
 */
export function SeoSharePanel({
  workspaceId,
  siteId,
  reportId,
}: {
  workspaceId: string;
  siteId: string;
  reportId: string;
}) {
  const { user } = useAuth();
  const { data, isLoading } = useGetSeoShareQuery({ workspaceId, siteId, reportId });
  const [setShare] = useSetSeoShareMutation();
  // The mutation's own `isLoading` is shared across every call it makes, so a
  // panel-save would light up the link toggle and New-link spinners too. Track
  // the instant link actions (enable/rotate) with their own flag instead.
  const [linkBusy, setLinkBusy] = useState(false);

  const enabled = data?.enabled ?? false;
  const token = data?.token ?? null;
  const views = data?.views ?? 0;
  const url = token ? `${window.location.origin}/seo-report/${token}` : "";

  const serverPanels = { ...DEFAULT_PANELS, ...(data?.panels ?? {}) };

  // Panel edits buffer and commit through the shared Save bar; the link on/off
  // and rotate act instantly. `null` means "no local edits, follow the server".
  const [draft, setDraft] = useState<SeoSharePanels | null>(null);
  const panels = draft ?? serverPanels;
  const onCount = ALL_PANELS.filter((p) => panels[p.key]).length;
  const dirty = draft !== null && ALL_PANELS.some((p) => draft[p.key] !== serverPanels[p.key]);

  const togglePanel = (key: keyof SeoSharePanels, next: boolean) =>
    setDraft({ ...panels, [key]: next });

  const setAll = (next: boolean) =>
    setDraft(Object.fromEntries(ALL_PANELS.map((p) => [p.key, next])) as SeoSharePanels);

  const savePanels = async () => {
    if (!draft) return;
    trace(user?.id, "save_seo_share_panels", "seo_share", "seo_share");
    try {
      await setShare({ workspaceId, siteId, reportId, enabled, panels: draft }).unwrap();
      setDraft(null);
      notify.success("What visitors can see has been updated.");
    } catch (e) {
      notify.error(errMessage(e, "Could not update what is shared."));
    }
  };

  useSaveRegistration(`seo-panels-${reportId}`, {
    dirty,
    save: savePanels,
    reset: () => setDraft(null),
  });

  const toggle = async (next: boolean) => {
    trace(user?.id, next ? "enable_seo_share_link" : "disable_seo_share_link", "seo_share", "seo_share");
    setLinkBusy(true);
    try {
      await setShare({ workspaceId, siteId, reportId, enabled: next }).unwrap();
      notify.success(
        next ? "Anyone with the link can now view this audit." : "The public link is now off.",
        next ? "Sharing on" : "Sharing off"
      );
    } catch (e) {
      notify.error(errMessage(e, "Could not update sharing."));
    } finally {
      setLinkBusy(false);
    }
  };

  const rotate = () =>
    confirmDelete({
      title: "Generate a new link?",
      confirmLabel: "Generate new link",
      body: "The current link stops working immediately. Anyone you already sent it to will lose access until you send the new one.",
      onConfirm: async () => {
        trace(user?.id, "rotate_seo_share_link", "seo_share", "seo_share");
        setLinkBusy(true);
        try {
          await setShare({ workspaceId, siteId, reportId, enabled: true, rotate: true }).unwrap();
          notify.success("A new link has been generated.", "Link replaced");
        } catch (e) {
          notify.error(errMessage(e, "Could not generate a new link."));
        } finally {
          setLinkBusy(false);
        }
      },
    });

  if (isLoading) {
    return (
      <Stack gap="md">
        <Skeleton height={40} radius="md" />
        <Skeleton height={100} radius="md" />
      </Stack>
    );
  }

  return (
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
            disabled={linkBusy}
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
                    onClick={() => {
                      trace(user?.id, "copy_report_link", "seo_share", "clipboard");
                      copy();
                    }}
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
                  disabled={onCount === ALL_PANELS.length} onClick={() => setAll(true)}>
                  All
                </Button>
                <Button size="compact-xs" variant="subtle" color="gray"
                  disabled={onCount === 0} onClick={() => setAll(false)}>
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
              loading={linkBusy}
            >
              New link
            </Button>
          </Group>
        </>
      )}
    </Stack>
  );
}
