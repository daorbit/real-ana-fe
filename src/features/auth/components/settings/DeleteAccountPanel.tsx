import { useState } from "react";
import { Button } from "@mantine/core";
import { UserX } from "lucide-react";
import { SecurityGroup, SecurityRow } from "./SecurityGroup";
import { DeleteAccountModal } from "./DeleteAccountModal";
import { useAuth } from "@/features/auth/context";

export function DeleteAccountPanel() {
  const { user, isDemo } = useAuth();
  const [open, setOpen] = useState(false);

  if (!user || isDemo || user.impersonating || user.role !== "user") return null;

  return (
    <>
      <SecurityGroup>
        <SecurityRow
          icon={UserX}
          hue="rose"
          danger
          title="Delete account"
          description="Permanently deletes your account, every workspace you own and all of their data."
          action={
            <Button variant="default" color="red" radius="xl" onClick={() => setOpen(true)}>
              Delete…
            </Button>
          }
        />
      </SecurityGroup>
      {open && <DeleteAccountModal user={user} onClose={() => setOpen(false)} />}
    </>
  );
}
