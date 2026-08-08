import { useNavigate } from "react-router-dom";
import { Box, Button, Card, Center, Stack, Text, ThemeIcon, Alert, Loader, Code } from "@mantine/core";
import { AlertTriangle, ShieldAlert } from "lucide-react";
import { AppShell } from "@/app/AppShell";
import { PageHeader } from "@/shared/ui/Page";
import { AudiencePicker } from "@/features/admin/components/email/AudiencePicker";
import { MessagePane } from "@/features/admin/components/email/MessagePane";
import { useEmailComposer } from "@/features/admin/useEmailComposer";
import { useIsPlatformAdmin } from "@/features/auth/context";

/**
 * Admin-only: send a message to a segment, a hand-typed list, or one account.
 *
 * Its own page rather than a modal — a broadcast is not a dialog stacked over
 * the Users table. Audience and message sit side by side, so the recipient
 * count is on screen when Send is pressed rather than a screen behind it.
 */
export default function AdminBroadcast() {
  const navigate = useNavigate();
  const isAdmin = useIsPlatformAdmin();

  // Nothing to close back to on this page — a broadcast page has no "was
  // this open" state, so onClose just resets the draft.
  const state = useEmailComposer({ opened: isAdmin, onClose: () => {} });
  const { status, statusLoading } = state;

  if (!isAdmin) {
    return (
      <AppShell>
        <Center mih="60vh">
          <Stack align="center" gap="sm">
            <ThemeIcon variant="light" color="gray" size={56} radius="md">
              <ShieldAlert size={28} />
            </ThemeIcon>
            <Text fw={600}>Admins only</Text>
            <Text c="dimmed" size="sm">This page isn't available on your account.</Text>
            <Button variant="light" onClick={() => navigate("/app")}>Back to Home</Button>
          </Stack>
        </Center>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <PageHeader
        title="New message"
        description="Pick who it goes to, write it, then send."
      />

      <Card withBorder radius="lg" p="lg">
        {statusLoading ? (
          <Center py="xl"><Loader size="sm" /></Center>
        ) : !status?.configured ? (
          <Alert color="orange" icon={<AlertTriangle size={16} />} title="Email isn't configured">
            <Text size="sm">
              The server has no Gmail credentials, so nothing can be sent yet. Set{" "}
              <Code>SMTP_USER</Code> and <Code>SMTP_PASS</Code> in the backend environment
              — <Code>SMTP_PASS</Code> must be a Google App Password, not the account
              password.
            </Text>
          </Alert>
        ) : (
          // Grid rather than flex: the audience column holds a fixed width and
          // the message takes the rest. Below the breakpoint they stack with
          // the picker on top, which is the order the decisions happen in.
          <Box
            style={{
              display: "grid",
              gap: 32,
              gridTemplateColumns: "minmax(260px, 320px) minmax(0, 1fr)",
              alignItems: "start",
            }}
            className="email-composer-grid"
          >
            <AudiencePicker state={state} />
            <MessagePane state={state} />
          </Box>
        )}
      </Card>
    </AppShell>
  );
}
