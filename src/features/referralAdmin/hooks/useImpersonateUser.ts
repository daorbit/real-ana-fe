import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth/context";
import { notify, errMessage } from "@/shared/lib/notify";

export function useImpersonateUser() {
  const { impersonate } = useAuth();
  const navigate = useNavigate();
  const [busy, setBusy] = useState<string | null>(null);

  const enter = async (target: { id: string; email: string }) => {
    setBusy(target.id);
    try {
      await impersonate(target.id);
      navigate("/app");
      notify.success(`You are now viewing as ${target.email}.`, "Impersonating");
    } catch (e) {
      notify.error(errMessage(e, "Could not switch to that user."));
    } finally {
      setBusy(null);
    }
  };

  return { enter, busy };
}
