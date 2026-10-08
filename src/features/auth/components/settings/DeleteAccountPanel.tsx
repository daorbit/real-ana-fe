import { useState } from "react";
import { Button } from "@mantine/core";
import { Trash2, UserX } from "lucide-react";
import { SettingsCard } from "./SettingsCard";
import { DeleteAccountModal } from "./DeleteAccountModal";
import { useAuth } from "@/features/auth/context";

export function DeleteAccountPanel() {
  const { user, isDemo } = useAuth();
  const [open, setOpen] = useState(false);

  if (!user || isDemo || user.impersonating || user.role !== "user") return null;

  return (
    <>
      <SettingsCard
        icon={UserX}
        title="Delete account"
        description="Permanently delete your account, every workspace you own and all of their data."
        action={
          <Button variant="default" color="red" leftSection={<Trash2 size={15} />} onClick={() => setOpen(true)}>
            Delete account
          </Button>
        }
      />
      {open && <DeleteAccountModal user={user} onClose={() => setOpen(false)} />}
    </>
  );
}
