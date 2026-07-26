import { useNavigate } from "react-router-dom";
import { Button, Card, Center, Stack, Text, ThemeIcon, Alert, Loader, Code } from "@mantine/core";
import { AlertTriangle, ShieldAlert } from "lucide-react";
import { AppShell } from "../components/AppShell";
import { PageHeader } from "../components/Page";
import { AudienceStep } from "../components/email/AudienceStep";
import { WriteStep } from "../components/email/WriteStep";
import { useEmailComposer } from "../hooks/useEmailComposer";
import { useAuth } from "../auth";

/**
 * Admin-only: send a message to a segment, a hand-typed list, or one account.
 *
 * Its own page rather than a modal — audience and write are steps on the
 * page itself, not a dialog stacked over the Users table.
 */
export default function AdminBroadcast() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === "admin" && !user?.impersonating;

  // Nothing to close back to on this page — a broadcast page has no "was
  // this open" state, so onClose just resets the draft.
  const state = useEmailComposer({ opened: isAdmin, onClose: () => {} });
  const { step, status, statusLoading } = state;

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
        title={step === "audience" ? "Who gets this?" : "Write your message"}
        description="Email a segment, a hand-typed list, or one account."
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
        ) : step === "audience" ? (
          <AudienceStep state={state} />
        ) : (
          <WriteStep state={state} />
        )}
      </Card>
    </AppShell>
  );
}
