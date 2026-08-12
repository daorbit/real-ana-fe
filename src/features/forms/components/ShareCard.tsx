import { Stack, Text, Group, Button, CopyButton, Alert, Box, Code } from "@mantine/core";
import { Copy, Check, ExternalLink, Send } from "lucide-react";
import { hostedFormUrl, embedSnippet } from "@/features/forms/lib/download";
import type { Form } from "@/features/forms/lib/types";

/**
 * How a published form gets in front of people.
 *
 * Two ways only: the hosted link, and an iframe of it. There is no embed script
 * — no CORS allowlist to keep and no origin to verify, which is the reason the
 * hosted route shipped first.
 *
 * A draft has a key already, but the URL 404s until it is published. Saying so
 * beats handing someone a link that quietly does not work.
 */
export function ShareCard({ form }: { form: Form }) {
  const url = hostedFormUrl(form.formKey);
  const snippet = embedSnippet(form.formKey);
  const live = form.status === "published";

  return (
    <Stack gap="md" maw={620}>
      {!live && (
        <Alert variant="light" color="orange">
          <Text size="sm">
            {form.status === "draft"
              ? "This form is still a draft — the link below will not open until you publish it."
              : "This form is closed. The link opens, but shows your closing message instead of the fields."}
          </Text>
        </Alert>
      )}

      <Stack gap={6}>
        <Text fw={650} size="sm">Link</Text>
        <Group gap="xs" wrap="nowrap">
          <Code style={{ flex: 1, padding: "8px 12px", overflowX: "auto", whiteSpace: "nowrap" }}>
            {url}
          </Code>
          <CopyButton value={url}>
            {({ copied, copy }) => (
              <Button
                variant="light"
                leftSection={copied ? <Check size={15} /> : <Copy size={15} />}
                onClick={copy}
              >
                {copied ? "Copied" : "Copy"}
              </Button>
            )}
          </CopyButton>
          <Button
            variant="subtle"
            component="a"
            href={url}
            target="_blank"
            rel="noreferrer"
            leftSection={<ExternalLink size={15} />}
            disabled={!live}
          >
            Open
          </Button>
        </Group>
        <Text size="xs" c="dimmed">
          Share it anywhere — email, a QR code, a link in your navigation. The page is not
          indexed by search engines, so it will not compete with your own pages.
        </Text>
      </Stack>

      <Stack gap={6}>
        <Text fw={650} size="sm">Embed on your own site</Text>
        <Box className="surface-card" p="sm">
          <Code block style={{ whiteSpace: "pre-wrap", wordBreak: "break-all" }}>{snippet}</Code>
        </Box>
        <Group gap="xs">
          <CopyButton value={snippet}>
            {({ copied, copy }) => (
              <Button
                size="xs"
                variant="light"
                leftSection={copied ? <Check size={14} /> : <Copy size={14} />}
                onClick={copy}
              >
                {copied ? "Copied" : "Copy snippet"}
              </Button>
            )}
          </CopyButton>
        </Group>
        <Text size="xs" c="dimmed">
          Paste this into any page. Nothing else to install — no script, no domain to
          allowlist.
        </Text>
      </Stack>

      {live && (
        <Alert variant="light" color="gray" icon={<Send size={15} />} p="xs">
          <Text size="xs">
            Responses land in this form’s Responses tab the moment they arrive, whether the
            visitor used the link or the embed.
          </Text>
        </Alert>
      )}
    </Stack>
  );
}
