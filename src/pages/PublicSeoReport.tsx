import { useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Box, Center, Loader, Stack, Text, Group, ThemeIcon, Anchor, Tooltip,
} from "@mantine/core";
import { EyeOff, ExternalLink, ShieldCheck } from "lucide-react";
import { Wordmark } from "../components/Brand";
import { useGetPublicSeoReportQuery } from "../store";
import { PublicSeoBody } from "../components/seo/PublicSeoBody";

/**
 * The public, read-only view of a shared SEO audit.
 *
 * Deliberately outside the app shell — no navigation, no theme toggle, nothing
 * that belongs to the signed-in owner. What renders is exactly what the server
 * sent, and the server sends only the sections the owner published, so a panel
 * missing here means it was never in the response, not merely hidden.
 */
export default function PublicSeoReport() {
  const { token = "" } = useParams();

  // `count: true` records the open exactly once — the first mount. RTK caches
  // the result, so React re-renders never re-hit the endpoint and never inflate
  // the counter.
  const { data, isLoading, isError } = useGetPublicSeoReportQuery(
    { token, count: true },
    { skip: !token }
  );

  useEffect(() => {
    if (data) {
      try {
        document.title = `SEO report — ${new URL(data.finalUrl).hostname}`;
      } catch {
        document.title = "SEO report";
      }
    }
  }, [data]);

  if (isLoading) {
    return (
      <Center h="70vh">
        <Loader size="sm" />
      </Center>
    );
  }

  if (isError || !data) {
    return (
      <Center h="70vh" px="md">
        <Stack align="center" gap="sm" maw={380}>
          <ThemeIcon size={48} radius="xl" variant="light" color="gray">
            <EyeOff size={24} />
          </ThemeIcon>
          <Text fw={650}>This link isn&apos;t available</Text>
          <Text size="sm" c="dimmed" ta="center">
            The audit may have been unshared, or the link replaced with a new
            one. Ask whoever sent it for an up-to-date link.
          </Text>
        </Stack>
      </Center>
    );
  }

  return (
    <Box mih="100vh" style={{ background: "var(--bg)" }}>
      {/* Branded header — the client sees who produced the report. */}
      <Box className="pub-bar">
        <Box className="pub-inner" style={{ maxWidth: 1080 }}>
          <Group justify="space-between" wrap="wrap" gap="sm">
            <Wordmark />
            <Group gap="xs" wrap="nowrap" style={{ minWidth: 0 }}>
              <Anchor
                href={data.finalUrl}
                target="_blank"
                rel="noopener noreferrer"
                size="sm"
                truncate
                maw={360}
              >
                {data.finalUrl}
              </Anchor>
              <ExternalLink size={13} style={{ opacity: 0.5, flexShrink: 0 }} />
            </Group>
          </Group>
        </Box>
      </Box>

      <Box className="pub-inner seo-report" style={{ maxWidth: 1080, paddingTop: 24, paddingBottom: 64 }}>
        <Stack gap="lg">
          <PublicSeoBody data={data} />

          <Group justify="center" gap={6} mt="md">
            <ShieldCheck size={13} style={{ opacity: 0.5 }} />
            <Text size="xs" c="dimmed">
              Read-only report shared via Quantalog
            </Text>
          </Group>
        </Stack>
      </Box>
    </Box>
  );
}
