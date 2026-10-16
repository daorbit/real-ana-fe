import { useState } from "react";
import { skipToken } from "@reduxjs/toolkit/query";
import {
  useConfirmWhatsAppVerificationMutation,
  useGetWhatsAppStatusQuery,
  useRemoveWhatsAppNumberMutation,
  useSendWhatsAppTestMutation,
  useSetWhatsAppEnabledMutation,
  useSetWhatsAppFormAlertsMutation,
  useStartWhatsAppVerificationMutation,
} from "@/app/store";
import { confirmDelete, notify, notifyError } from "@/shared/lib/notify";
import type { WhatsAppNumber } from "@/shared/types";

export function formatPhone(n: Pick<WhatsAppNumber, "phone" | "label">): string {
  return n.label ? `${n.label} · +${n.phone}` : `+${n.phone}`;
}

export function useWhatsAppConnection(workspaceId: string | null) {
  const query = useGetWhatsAppStatusQuery(workspaceId ?? skipToken);
  const status = query.currentData;
  const [setEnabled, enableState] = useSetWhatsAppEnabledMutation();
  const [startVerification, startState] = useStartWhatsAppVerificationMutation();
  const [confirmVerification, confirmState] = useConfirmWhatsAppVerificationMutation();
  const [setFormAlerts, alertsState] = useSetWhatsAppFormAlertsMutation();
  const [removeNumber] = useRemoveWhatsAppNumberMutation();
  const [sendTest, testState] = useSendWhatsAppTestMutation();
  const [pendingPhone, setPendingPhone] = useState<string | null>(null);

  const toggle = async (enabled: boolean) => {
    if (!workspaceId) return;
    try {
      await setEnabled({ workspaceId, enabled }).unwrap();
      notify.success(enabled ? "WhatsApp is on. Add a number to start receiving messages." : "WhatsApp is off.");
    } catch (e) {
      notifyError(e, "Could not change WhatsApp.");
    }
  };

  const sendCode = async (phone: string, label: string) => {
    if (!workspaceId) return false;
    try {
      const result = await startVerification({ workspaceId, phone, label }).unwrap();
      setPendingPhone(result.phone);
      notify.success(`Code sent to +${result.phone} on WhatsApp.`);
      return true;
    } catch (e) {
      notifyError(e, "Could not send the code.");
      return false;
    }
  };

  const verify = async (code: string) => {
    if (!workspaceId || !pendingPhone) return false;
    try {
      await confirmVerification({ workspaceId, phone: pendingPhone, code }).unwrap();
      notify.success(`+${pendingPhone} is connected.`);
      setPendingPhone(null);
      return true;
    } catch (e) {
      notifyError(e, "Could not verify that code.");
      return false;
    }
  };

  const remove = (n: WhatsAppNumber) => {
    if (!workspaceId) return;
    confirmDelete({
      title: "Remove this number?",
      body: `${formatPhone(n)} will stop getting every report and form alert in this workspace that sends to it.`,
      onConfirm: async () => {
        try {
          await removeNumber({ workspaceId, phone: n.phone }).unwrap();
        } catch (e) {
          notifyError(e, "Could not remove the number.");
        }
      },
    });
  };

  const toggleFormAlerts = async (n: WhatsAppNumber, formAlerts: boolean) => {
    if (!workspaceId) return;
    try {
      await setFormAlerts({ workspaceId, phone: n.phone, formAlerts }).unwrap();
    } catch (e) {
      notifyError(e, "Could not change form alerts for this number.");
    }
  };

  const test = async () => {
    if (!workspaceId) return;
    try {
      const result = await sendTest({ workspaceId }).unwrap();
      if (result.sent.length) notify.success(`Test sent to ${result.sent.join(", ")}.`);
      for (const f of result.failed) notify.error(`${f.phone}: ${f.error}`);
    } catch (e) {
      notifyError(e, "Could not send the test message.");
    }
  };

  return {
    status,
    loading: query.isLoading,
    refreshing: query.isFetching,
    refresh: () => void query.refetch(),
    pendingPhone,
    cancelPending: () => setPendingPhone(null),
    toggling: enableState.isLoading,
    sendingCode: startState.isLoading,
    verifying: confirmState.isLoading,
    savingAlertsFor: alertsState.isLoading ? alertsState.originalArgs?.phone ?? null : null,
    testing: testState.isLoading,
    toggle,
    sendCode,
    verify,
    remove,
    toggleFormAlerts,
    test,
  };
}
