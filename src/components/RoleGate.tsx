import { Card, Center, Stack, Text, ThemeIcon } from "@mantine/core";
import { Lock } from "lucide-react";
import { usePermissions } from "../workspace";
import { ROLE_RANK, type WorkspaceRole } from "../types";

/**
 * Hides a whole page from members whose role doesn't reach it.
 *
 * For features that are entirely one permission level — API keys, public
 * sharing — where hiding each button individually would leave a page of
 * headings explaining things the reader cannot do. Features that merely have
 * *some* restricted actions gate those actions instead, with `usePermissions`.
 *
 * This is a courtesy, not a control: every route behind it is enforced
 * server-side, so a viewer who navigates here directly still gets a 403 from
 * the API. What this prevents is offering an action that could only fail.
 */
export function RoleGate({
  minimum,
  what,
  children,
}: {
  minimum: WorkspaceRole;
  /** Named in the refusal — "Only admins can manage API keys." */
  what: string;
  children: React.ReactNode;
}) {
  const { role } = usePermissions();

  // No role yet means the workspace list is still loading. Render the page
  // rather than flashing a refusal at someone who turns out to be the owner.
  if (!role) return <>{children}</>;

  if (ROLE_RANK[role] >= ROLE_RANK[minimum]) return <>{children}</>;

  return (
    <Card withBorder radius="lg" padding="xl">
      <Center py="xl">
        <Stack align="center" gap={8} maw={380}>
          <ThemeIcon variant="light" color="gray" size={52} radius="md">
            <Lock size={22} />
          </ThemeIcon>
          <Text fw={600} mt={4}>
            {minimum === "owner" ? "Owner only" : `${minimum[0].toUpperCase()}${minimum.slice(1)}s only`}
          </Text>
          <Text c="dimmed" size="sm" ta="center">
            {what} You have {role} access to this workspace — ask an admin if you
            need to change that.
          </Text>
        </Stack>
      </Center>
    </Card>
  );
}
