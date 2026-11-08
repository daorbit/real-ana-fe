import { Box, Button, Group, Stack, Text, Title } from "@mantine/core";
import { ArrowLeft, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth/context";
import { useTitle } from "@/shared/lib/useTitle";


export function NotFound() {
  const nav = useNavigate();
  const { user } = useAuth();
  const home = user ? "/app" : "/login";
  useTitle("Page not found");

  return (
    <Box style={{ minHeight: "100dvh", display: "grid", placeItems: "center", padding: "2rem" }}>
      <Stack gap="md" maw={420} align="center" ta="center">
        <Text fw={700} size="3rem" c="dimmed" style={{ letterSpacing: "-0.04em" }}>
          404
        </Text>
        <Title order={3}>This page doesn't exist</Title>
        <Text size="sm" c="dimmed">
          The link may be out of date, or the address has a typo. Nothing here is
          broken — the page just isn't one we have.
        </Text>
        <Group gap="sm" mt="xs">
          <Button variant="default" leftSection={<ArrowLeft size={15} />} onClick={() => nav(-1)}>
            Go back
          </Button>
          <Button leftSection={<Home size={15} />} onClick={() => nav(home, { replace: true })}>
            {user ? "Dashboard" : "Sign in"}
          </Button>
        </Group>
      </Stack>
    </Box>
  );
}
