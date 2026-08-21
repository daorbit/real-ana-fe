import { useSearchParams } from "react-router-dom";
import { Box, Code, Stack, Text, Title } from "@mantine/core";
import { CheckCircle2 } from "lucide-react";

/**
 * The status page Meta's Data Deletion Request callback points at.
 *
 * Meta requires the callback to answer with a URL where the person can check
 * what happened to their request, and it checks that the URL loads. This is that
 * page — unauthenticated by necessity, since someone who has just deleted their
 * connection has no reason to hold an account here, and being asked to sign in
 * to confirm a deletion is exactly the wrong thing to ask.
 *
 * It states a completed deletion rather than a queued one because that is what
 * actually happens: the callback removes the connection and its schedules
 * synchronously before replying, so by the time this page can be loaded there is
 * nothing left pending. The confirmation code is echoed back for someone
 * matching it against what Meta showed them.
 */
export default function DataDeletion() {
  const [params] = useSearchParams();
  const code = params.get("code") ?? "";

  return (
    <Box
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: "var(--mantine-spacing-md)",
      }}
    >
      <Stack gap="sm" style={{ maxWidth: 460, textAlign: "center" }} align="center">
        <CheckCircle2 size={34} style={{ color: "var(--mantine-color-teal-6)" }} />
        <Title order={2} size="h3">Your Instagram data has been deleted</Title>
        <Text c="dimmed" size="sm">
          Quantalog has removed the Instagram connection for your account, along
          with the stored access token and any posts scheduled to it. Nothing
          from your Instagram account remains.
        </Text>
        <Text c="dimmed" size="sm">
          Posts that were already published to Instagram are not affected —
          Quantalog cannot remove those, so delete them in the Instagram app if
          you want them gone.
        </Text>
        {code && (
          <Box mt="xs">
            <Text size="xs" c="dimmed" mb={4}>Confirmation code</Text>
            <Code>{code}</Code>
          </Box>
        )}
      </Stack>
    </Box>
  );
}
