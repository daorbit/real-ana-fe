import { useSearchParams } from "react-router-dom";
import { Box, Code, Stack, Text, Title } from "@mantine/core";
import { CheckCircle2 } from "lucide-react";
import { useTitle } from "@/shared/lib/useTitle";


export default function DataDeletion() {
  const [params] = useSearchParams();
  const code = params.get("code") ?? "";
  useTitle("Data deletion");

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
