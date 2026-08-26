import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Card, Text, Title, Button, Stack, Center, Loader, ThemeIcon, Alert, Badge,
} from "@mantine/core";
import { Users, AlertTriangle } from "lucide-react";
import { useGetInviteQuery, useAcceptInviteMutation } from "@/app/store";
import { notify, errMessage } from "@/shared/lib/notify";
import { useAuth } from "@/features/auth/context";
import { trace } from "@/shared/lib/analytics";
import { ACTIVE_WORKSPACE_KEY } from "@/features/workspace/context";

/**
 * The landing page for a workspace invitation link.
 *
 * Deliberately readable signed-out: it says who invited you and to what before
 * asking you to authenticate, because an invite link that opens a bare login
 * form gives no reason to complete it. The details come from a public endpoint
 * that returns only what the email already said.
 *
 * Signed in, it accepts immediately on the button. Signed out, it sends you to
 * login or signup with the invite path remembered, so you land back here.
 *
 * Deliberately does *not* use `useWorkspace`: this route lives outside
 * `WorkspaceProvider`, because a signed-out visitor has no workspace list to
 * fetch. Reaching for the context here is what threw "useWorkspace outside
 * provider" on the live page.
 */
export default function AcceptInvite() {
  const { token = "" } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: invite, isLoading, error } = useGetInviteQuery(token, { skip: !token });
  const [accept, { isLoading: accepting }] = useAcceptInviteMutation();
  const [done, setDone] = useState(false);

  /**
   * Where to come back to after logging in or signing up. Stored rather than
   * passed as a query parameter because the auth flow can bounce through
   * Google, and a redirect parameter does not survive that round trip.
   */
  useEffect(() => {
    if (token) sessionStorage.setItem("pendingInvite", `/invite/${token}`);
  }, [token]);

  const claim = async () => {
    trace(user?.id, "accept_invite_clicked", "accept_invite", "workspace");
    try {
      const result = await accept(token).unwrap();
      sessionStorage.removeItem("pendingInvite");
      setDone(true);

      // Land them in the workspace they just joined rather than whichever one
      // happened to be active before. Written straight to storage because the
      // workspace context does not exist on this route — the provider reads
      // this key when it mounts on the other side of the navigation.
      localStorage.setItem(ACTIVE_WORKSPACE_KEY, result.workspaceId);

      notify.success(`You've joined ${result.workspaceName}.`);
      navigate("/app");
    } catch (err) {
      notify.error(errMessage(err, "Could not accept this invitation."));
    }
  };

  if (!token) return null;

  return (
    <Center mih="100vh" p="md">
      <Card withBorder radius="lg" padding="xl" w="100%" maw={440}>
        {isLoading ? (
          <Center py="xl"><Loader size="sm" /></Center>
        ) : error || !invite ? (
          <Stack align="center" gap="sm">
            <ThemeIcon variant="light" color="red" size="xl" radius="md">
              <AlertTriangle size={20} />
            </ThemeIcon>
            <Title order={4}>This invitation isn&apos;t valid</Title>
            <Text size="sm" c="dimmed" ta="center">
              {errMessage(error, "The link may have expired or already been used. Ask for a new one.")}
            </Text>
            <Button component={Link} to="/app" variant="light" mt="sm">
              Go to Quantalog
            </Button>
          </Stack>
        ) : (
          <Stack align="center" gap="sm">
            <ThemeIcon variant="light" color="emerald" size={48} radius="md">
              <Users size={22} />
            </ThemeIcon>

            <Title order={4} ta="center" style={{ letterSpacing: "-0.01em" }}>
              Join {invite.workspaceName}
            </Title>
            <Text size="sm" c="dimmed" ta="center">
              <strong>{invite.inviterName}</strong> invited you to collaborate on{" "}
              {invite.workspaceName}.
            </Text>

            <Badge variant="light" color="gray" tt="capitalize" mt={4}>
              {invite.role} access
            </Badge>

            {user ? (
              <>
                {/* The invited address and the signed-in account can differ —
                    the token is what grants access, not the address. Saying so
                    prevents "did I accept this as the wrong person?". */}
                {user.email.toLowerCase() !== invite.email.toLowerCase() && (
                  <Alert variant="light" color="yellow" radius="md" mt="sm">
                    <Text size="xs">
                      This was sent to {invite.email}, and you&apos;re signed in as{" "}
                      {user.email}. Accepting will add <strong>this</strong> account.
                    </Text>
                  </Alert>
                )}
                <Button fullWidth mt="md" loading={accepting || done} onClick={claim}>
                  Accept invitation
                </Button>
              </>
            ) : (
              <Stack gap="xs" w="100%" mt="md">
                <Button
                  fullWidth
                  component={Link}
                  to={invite.hasAccount ? "/login" : "/signup"}
                >
                  {invite.hasAccount ? "Sign in to accept" : "Create an account to accept"}
                </Button>
                <Text size="xs" c="dimmed" ta="center">
                  {invite.hasAccount
                    ? `Sign in as ${invite.email} and you'll come straight back here.`
                    : `Sign up with ${invite.email} and you'll come straight back here.`}
                </Text>
              </Stack>
            )}
          </Stack>
        )}
      </Card>
    </Center>
  );
}
