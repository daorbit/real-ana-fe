import { useState } from "react";
import { Button } from "@mantine/core";
import { KeyRound } from "lucide-react";
import { useAuth } from "@/features/auth/context";
import { SecurityRow } from "./SecurityGroup";
import { StatusBadge } from "./StatusBadge";
import { PasswordModal } from "./PasswordModal";
import { SECURITY_ROW_IDS } from "./securityRows";

export function PasswordPanel() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  if (!user) return null;

  return (
    <>
      <SecurityRow
        id={SECURITY_ROW_IDS.password}
        icon={KeyRound}
        hue="slate"
        title={user.hasPassword ? "Password" : "Set a password"}
        status={<StatusBadge on={Boolean(user.hasPassword)} onLabel="Set" offLabel="Not set" />}
        description={
          user.hasPassword
            ? "Used when you log in with your email."
            : "You sign in with Google or LinkedIn only. Add a password to log in with email too."
        }
        action={
          <Button variant="default" radius="xl" onClick={() => setOpen(true)}>
            {user.hasPassword ? "Change" : "Set password"}
          </Button>
        }
      />
      <PasswordModal opened={open} onClose={() => setOpen(false)} />
    </>
  );
}
