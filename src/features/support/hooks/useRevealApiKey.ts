import { useTranslation } from "react-i18next";
import { useRevealApiKeyMutation } from "@/app/store";
import { useAuth } from "@/features/auth/context";
import { identityProof } from "@/features/auth/components/settings/identityProof";
import { useDemo } from "@/features/demo/context";
import { notify, errMessage } from "@/shared/lib/notify";
import type { ApiKey } from "@/shared/types";

export function useRevealApiKey(workspaceId: string) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { demo } = useDemo();
  const [revealMutation, { isLoading: revealing }] = useRevealApiKeyMutation();

  const reveal = async (key: ApiKey, secret: string): Promise<string | null> => {
    if (!user) return null;
    if (demo) {
      notify.error("Turn off demo data to reveal a key.");
      return null;
    }
    try {
      const res = await revealMutation({
        workspaceId,
        keyId: key.id,
        proof: identityProof(user, secret),
      }).unwrap();
      return res.key;
    } catch (err) {
      notify.error(errMessage(err, t("developers.revealError")));
      return null;
    }
  };

  return { user, reveal, revealing };
}
