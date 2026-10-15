import { useState } from "react";
import {
  useDisconnectFormsPaymentsMutation,
  useSaveFormsPaymentsMutation,
  useTestFormsPaymentsMutation,
} from "@/app/store";
import { notify, notifyError } from "@/shared/lib/notify";
import type { PaymentMode, PaymentProvider, PaymentSettingsInput, ProviderSettings } from "../types";

export function usePaymentSetup(workspaceId: string, provider: PaymentProvider, view: ProviderSettings | undefined) {
  const [tab, setTab] = useState<PaymentMode>(view?.mode ?? "test");
  const [keyId, setKeyId] = useState("");
  const [keySecret, setKeySecret] = useState("");
  const [webhookSecret, setWebhookSecret] = useState("");
  const [saveSettings, saveState] = useSaveFormsPaymentsMutation();
  const [testSettings, testState] = useTestFormsPaymentsMutation();
  const [removeKeys, removeState] = useDisconnectFormsPaymentsMutation();
  const label = view?.label ?? "The gateway";

  const clearInputs = () => {
    setKeyId("");
    setKeySecret("");
    setWebhookSecret("");
  };

  const switchTab = (next: PaymentMode) => {
    setTab(next);
    clearInputs();
  };

  const send = async (input: PaymentSettingsInput, success: string) => {
    try {
      await saveSettings({ workspaceId, input: { provider, ...input } }).unwrap();
      notify.success(success);
      return true;
    } catch (e) {
      notifyError(e, "Could not save payment settings.");
      return false;
    }
  };

  const saveKeys = async () => {
    const saved = await send(
      {
        target: tab,
        keyId: keyId.trim() || undefined,
        keySecret: keySecret.trim() || undefined,
        webhookSecret: webhookSecret.trim() || undefined,
      },
      "Saved.",
    );
    if (saved) {
      setKeySecret("");
      setWebhookSecret("");
    }
  };

  const update = (patch: PaymentSettingsInput, success: string) => send(patch, success);

  const test = async () => {
    try {
      const result = await testSettings({ workspaceId, mode: tab, provider }).unwrap();
      if (result.ok) notify.success(`${tab === "live" ? "Live" : "Test"} keys work.`);
      else notify.error(result.message ?? `${label} rejected these keys.`);
    } catch (e) {
      notifyError(e, "Could not reach the forms service.");
    }
  };

  const remove = async () => {
    try {
      await removeKeys({ workspaceId, mode: tab, provider }).unwrap();
      clearInputs();
      notify.info(`${tab === "live" ? "Live" : "Test"} keys removed.`);
    } catch (e) {
      notifyError(e, "Could not remove the keys.");
    }
  };

  return {
    tab,
    switchTab,
    keyId,
    setKeyId,
    keySecret,
    setKeySecret,
    webhookSecret,
    setWebhookSecret,
    saveKeys,
    update,
    test,
    remove,
    saving: saveState.isLoading || removeState.isLoading,
    testing: testState.isLoading,
  };
}
