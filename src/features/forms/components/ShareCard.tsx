import { Card, Group, Text, Stack, Button, CopyButton, Code, Box } from "@mantine/core";
import { Check, Link as LinkIcon, Code2 } from "lucide-react";
import type { LeadForm } from "@/shared/types";

// No dedicated public-forms origin env var exists yet; this mirrors
// `site.url` in quantalog-lp/src/lib/site.ts. Move to VITE_PUBLIC_FORM_BASE
// if the marketing origin ever diverges from the dashboard's assumption.
const PUBLIC_FORM_ORIGIN = "https://quantalog.daorbit.in";

export function ShareCard({ form }: { form: LeadForm }) {
  const url = `${PUBLIC_FORM_ORIGIN}/f/${form.formKey}`;
  const snippet = `<iframe src="${url}" width="100%" height="640" frameborder="0"></iframe>`;

  return (
    <Card withBorder radius="lg" padding="lg">
      <Text fw={600} c="dimmed" size="sm" mb="md">Share</Text>

      <Stack gap="md">
        <div>
          <Text size="xs" c="dimmed" mb={4}>Hosted URL</Text>
          <Group gap="sm" wrap="nowrap">
            <Code style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {url}
            </Code>
            <CopyButton value={url}>
              {({ copied, copy }) => (
                <Button
                  size="xs"
                  variant="default"
                  onClick={copy}
                  leftSection={copied ? <Check size={13} /> : <LinkIcon size={13} />}
                >
                  {copied ? "Copied" : "Copy link"}
                </Button>
              )}
            </CopyButton>
          </Group>
        </div>

        <div>
          <Text size="xs" c="dimmed" mb={4}>Embed as an iframe</Text>
          <Box
            style={{
              border: "1px solid var(--mantine-color-default-border)",
              borderRadius: "var(--mantine-radius-md)",
              padding: 12,
              fontFamily: "monospace",
              fontSize: 12,
              wordBreak: "break-all",
            }}
          >
            {snippet}
          </Box>
          <Group justify="flex-end" mt={8}>
            <CopyButton value={snippet}>
              {({ copied, copy }) => (
                <Button
                  size="xs"
                  variant="default"
                  onClick={copy}
                  leftSection={copied ? <Check size={13} /> : <Code2 size={13} />}
                >
                  {copied ? "Copied" : "Copy embed code"}
                </Button>
              )}
            </CopyButton>
          </Group>
        </div>
      </Stack>
    </Card>
  );
}
