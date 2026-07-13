import { useState } from "react";
import { Alert, Text, Group, Button, Code, Stack, Collapse, CopyButton, Badge } from "@mantine/core";
import { ArrowUpCircle, Check, Copy } from "lucide-react";
import { API_ORIGIN } from "../api";

/**
 * Shown when a workspace has sites on a tracker too old to report scroll depth.
 *
 * Most sites hotlink the script and upgrade themselves on the next page load,
 * so this is aimed at the ones that copied it into their own build — for them
 * the panel would otherwise just read as "no data" forever.
 */
export function TrackerUpdate({
  sites,
}: {
  sites: { siteId: string; name: string }[];
}) {
  const [open, setOpen] = useState(false);
  if (sites.length === 0) return null;

  const snippet = `<script async src="${API_ORIGIN}/tracker.js" data-site="YOUR_SITE_ID"></script>`;

  return (
    <Alert color="amber" variant="light" radius="md" mb="lg" icon={<ArrowUpCircle size={18} />}>
      <Group justify="space-between" wrap="nowrap" align="flex-start">
        <div>
          <Text size="sm" fw={600}>
            {sites.length} site{sites.length === 1 ? "" : "s"} on an older tracker
          </Text>
          <Text size="sm" c="dimmed" mt={2}>
            Scroll depth needs the latest script. Sites that load it from us
            update on their own — this only affects ones serving their own copy.
          </Text>
          <Group gap={6} mt={8}>
            {sites.slice(0, 5).map((s) => (
              <Badge key={s.siteId} size="sm" variant="light" color="gray">{s.name}</Badge>
            ))}
            {sites.length > 5 && (
              <Badge size="sm" variant="light" color="gray">+{sites.length - 5} more</Badge>
            )}
          </Group>
        </div>
        <Button
          size="xs"
          variant="light"
          color="amber"
          onClick={() => setOpen((v) => !v)}
          style={{ flexShrink: 0 }}
        >
          {open ? "Hide" : "Show script"}
        </Button>
      </Group>

      <Collapse expanded={open}>
        <Stack gap="xs" mt="md">
          <Text size="xs" fw={600} c="dimmed" tt="uppercase" style={{ letterSpacing: "0.05em" }}>
            Replace your script tag with this
          </Text>
          <Group gap="xs" wrap="nowrap" align="flex-start">
            <Code block style={{ flex: 1, fontSize: 12 }}>{snippet}</Code>
            <CopyButton value={snippet}>
              {({ copied, copy }) => (
                <Button
                  size="xs"
                  variant="light"
                  color={copied ? "emerald" : "gray"}
                  leftSection={copied ? <Check size={13} /> : <Copy size={13} />}
                  onClick={copy}
                  style={{ flexShrink: 0 }}
                >
                  {copied ? "Copied" : "Copy"}
                </Button>
              )}
            </CopyButton>
          </Group>
          <Text size="xs" c="dimmed">
            No markup needed — scroll depth starts working as soon as the new
            script loads.
          </Text>
        </Stack>
      </Collapse>
    </Alert>
  );
}
