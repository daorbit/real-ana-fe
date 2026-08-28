import type { ReactNode } from "react";
import { Box, Button, Group, Stack, Text } from "@mantine/core";
import {
  INSTAGRAM_PINK, InstagramMark, LINKEDIN_BLUE, LinkedInMark,
} from "@/shared/ui/LinkedInMark";
import type { PostAccount } from "@/shared/types";

/**
 * Shown only while nothing can publish.
 *
 * A chooser rather than a warning. Two networks can publish from here and the
 * decision is the user's, so this presents both as equal options with their own
 * state and their own button — an alert bar naming one of them states that
 * LinkedIn is *the* precondition, which stopped being true when Instagram was
 * added.
 *
 * Disconnecting is not offered here: that lives with the connection's own
 * settings, and this component only ever appears when nothing is connected.
 */
export function ConnectPrompt({
  linkedin,
  instagram,
  showInstagram = true,
  connecting,
  onConnect,
  onConnectInstagram,
}: {
  linkedin: PostAccount | undefined;
  instagram: PostAccount | undefined;
  /** Instagram is held back to super_admins while the integration is finished. */
  showInstagram?: boolean;
  /** True while a connection popup is open, so the button that opened it spins. */
  connecting: boolean;
  onConnect: () => void;
  onConnectInstagram: () => void;
}) {
  return (
    <Box mb="lg">
      <Text fw={650} size="sm">Connect an account to publish</Text>
      <Text size="xs" c="dimmed" mt={2} mb="md">
        Pick the network you want to post to. You can connect both — each post
        chooses one when you write it.
      </Text>

      <div className="connect-choice">
        <NetworkChoice
          mark={<LinkedInMark size={22} />}
          tint={LINKEDIN_BLUE}
          name="LinkedIn"
          account={linkedin}
          hint="Publishes to your own member feed."
          /* Said before the consent screen, not after it. LinkedIn describes
             the publishing scope as create/modify/delete — the reach of the
             only permission it offers, not what this app does with it. */
          note="LinkedIn asks to allow creating, modifying and deleting posts — the wording of its single publishing permission. Quantalog only creates the posts you schedule."
          connecting={connecting}
          onConnect={onConnect}
        />

        {showInstagram && (
          <NetworkChoice
            mark={<InstagramMark size={22} />}
            tint={INSTAGRAM_PINK}
            name="Instagram"
            account={instagram}
            hint="Publishes to a Business or Creator account."
            note="Personal Instagram accounts cannot publish through any app. Switch the account type in the Instagram app first."
            connecting={connecting}
            onConnect={onConnectInstagram}
          />
        )}
      </div>
    </Box>
  );
}

/**
 * One network's card.
 *
 * The button's wording follows the account's actual state rather than always
 * saying "Connect": a connection that exists but lapsed, or one made for
 * sign-in without the publishing grant, both need another trip through consent
 * — and calling that "Connect" hides that there is already something there.
 */
function NetworkChoice({
  mark,
  tint,
  name,
  account,
  hint,
  note,
  connecting,
  onConnect,
}: {
  mark: ReactNode;
  tint: string;
  name: string;
  account: PostAccount | undefined;
  hint: string;
  note: string;
  connecting: boolean;
  onConnect: () => void;
}) {
  const expired = Boolean(account?.connected && account.expired);
  const needsPosting = Boolean(
    account?.connected && !account.expired && account.canPublish === false,
  );

  const label = expired
    ? `Reconnect ${name}`
    : needsPosting
      ? "Allow posting"
      : `Connect ${name}`;

  const state = expired
    ? "Connection expired — reconnect to resume publishing."
    : needsPosting
      ? "Connected for sign-in only. Allow posting to schedule from here."
      : hint;

  return (
    <Box className="connect-choice__card">
      <Group gap={10} wrap="nowrap" align="center">
        <Box
          aria-hidden
          className="connect-choice__mark"
          style={{ background: `color-mix(in srgb, ${tint} 16%, transparent)` }}
        >
          {mark}
        </Box>
        <Text fw={600}>{name}</Text>
      </Group>

      <Stack gap={6} mt="sm" style={{ flex: 1 }}>
        <Text size="sm" c={expired ? "orange" : "dimmed"}>{state}</Text>
        <Text size="xs" c="dimmed" style={{ lineHeight: 1.5 }}>{note}</Text>
      </Stack>

      <Button
        mt="md"
        size="sm"
        fullWidth
        loading={connecting}
        onClick={onConnect}
        style={{ background: tint, color: "#fff" }}
      >
        {label}
      </Button>
    </Box>
  );
}
