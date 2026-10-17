import { Alert, Box, Card, Center, Code, Loader, Text } from "@mantine/core";
import { AlertTriangle } from "lucide-react";
import { AudiencePicker } from "@/features/admin/components/email/AudiencePicker";
import { MessagePane } from "@/features/admin/components/email/MessagePane";
import { useEmailComposer } from "@/features/admin/useEmailComposer";
import { AdminSection } from "../layout/AdminSection";
import classes from "@/features/admin/components/Admin.module.css";

export default function EmailPanel() {
  const state = useEmailComposer({ opened: true, onClose: () => {} });
  const { status, statusLoading } = state;

  return (
    <AdminSection id="email">
      <Card withBorder radius="lg" p={{ base: "md", sm: "lg" }}>
        {statusLoading ? (
          <Center py="xl"><Loader size="sm" /></Center>
        ) : !status?.configured ? (
          <Alert color="orange" icon={<AlertTriangle size={16} />} title="Email isn't configured">
            <Text size="sm">
              The server has no Gmail credentials, so nothing can be sent yet. Set <Code>SMTP_USER</Code> and{" "}
              <Code>SMTP_PASS</Code> in the backend environment. <Code>SMTP_PASS</Code> must be a Google App
              Password, not the account password.
            </Text>
          </Alert>
        ) : (
          <Box className={classes.composerGrid}>
            <AudiencePicker state={state} />
            <MessagePane state={state} />
          </Box>
        )}
      </Card>
    </AdminSection>
  );
}
