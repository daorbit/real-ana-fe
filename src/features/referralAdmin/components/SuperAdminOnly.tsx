import { useNavigate } from "react-router-dom";
import { Button, Center, Stack, Text, ThemeIcon } from "@mantine/core";
import { ShieldAlert } from "lucide-react";

export function SuperAdminOnly() {
  const navigate = useNavigate();
  return (
    <Center mih="60vh">
      <Stack align="center" gap="sm">
        <ThemeIcon variant="light" color="gray" size={56} radius="md">
          <ShieldAlert size={28} />
        </ThemeIcon>
        <Text fw={600}>Super admins only</Text>
        <Text c="dimmed" size="sm">This page isn't available on your account.</Text>
        <Button variant="light" onClick={() => navigate("/app")}>Back to Home</Button>
      </Stack>
    </Center>
  );
}
