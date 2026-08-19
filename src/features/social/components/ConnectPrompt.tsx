import { Alert, Button, Group, Text } from "@mantine/core";
import { TriangleAlert } from "lucide-react";
import { LINKEDIN_BLUE } from "@/shared/ui/LinkedInMark";
import type { LinkedInStatus } from "@/shared/types";

/**
 * Shown only while nothing can publish.
 *
 * The connection is the precondition for everything on this page, so its state
 * is stated once at the top and carries the button that fixes it — sending
 * someone to another page to connect makes the thing they came here to do a
 * two-stop errand. Disconnecting is not offered here: that lives with the
 * connection's own settings.
 */
export function ConnectPrompt({
  linkedin,
  needsPostingPermission,
  connecting,
  onConnect,
}: {
  linkedin: LinkedInStatus | undefined;
  /** Connected for sign-in, but never granted the publishing scope. */
  needsPostingPermission: boolean;
  connecting: boolean;
  onConnect: () => void;
}) {
  const expired = linkedin?.expired;

  return (
    <Alert
      color={expired ? "orange" : "blue"}
      variant="light"
      icon={<TriangleAlert size={18} />}
      mb="lg"
    >
      <Group justify="space-between" align="center" wrap="nowrap" gap="md">
        <Text size="sm">
          {expired
            ? "Your LinkedIn connection has expired. Reconnect it to resume publishing."
            : needsPostingPermission
              ? "Your LinkedIn account is connected for sign-in. Allow posting to schedule posts from here."
              : "Connect your LinkedIn account to start scheduling posts."}
        </Text>
        <Button
          size="compact-sm"
          loading={connecting}
          onClick={onConnect}
          style={{ background: LINKEDIN_BLUE, color: "#fff", flexShrink: 0 }}
        >
          {expired ? "Reconnect LinkedIn" : needsPostingPermission ? "Allow posting" : "Connect LinkedIn"}
        </Button>
      </Group>

      {/* Said before the consent screen, not after it. LinkedIn describes the
          publishing scope as create/modify/delete — the reach of the only
          permission it offers, not what this app does with it. */}
      {!expired && (
        <Text size="xs" c="dimmed" mt={8} style={{ lineHeight: 1.5 }}>
          LinkedIn will ask you to allow creating, modifying and deleting posts — that is the
          wording of the single permission it offers for publishing. Quantalog only ever creates
          the posts you schedule here. It never edits or deletes anything on your profile.
        </Text>
      )}
    </Alert>
  );
}
