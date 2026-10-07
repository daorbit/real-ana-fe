import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth/context";
import { notify, errMessage } from "@/shared/lib/notify";
import { trace } from "@/shared/lib/analytics";

export function useImpersonateUser(source = "impersonate") {
  const { user, impersonate } = useAuth();
  const navigate = useNavigate();
  const [busy, setBusy] = useState<string | null>(null);

  const enter = async (target: { id: string; email: string }) => {
    trace(user?.id, "impersonate_user", source, target.id);
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
