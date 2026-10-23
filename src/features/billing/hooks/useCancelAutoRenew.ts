import { useTranslation } from "react-i18next";
import { useCancelAutoRenewMutation } from "@/app/store";
import { confirmDelete, notify, errMessage } from "@/shared/lib/notify";
import { shortDate } from "@/shared/lib/format";

export function useCancelAutoRenew(workspaceId: string, planName: string, activeUntil: string | null) {
  const { t } = useTranslation();
  const [cancelAutoRenew] = useCancelAutoRenewMutation();

  return () =>
    confirmDelete({
      title: t("billing.cancelSubTitle", "Cancel subscription?"),
      body: activeUntil
        ? t("billing.cancelSubBody", "{{plan}} stays active until {{date}}. You won't be charged again.", {
            plan: planName,
            date: shortDate(activeUntil),
          })
        : t("billing.cancelSubBodyNoDate", "You won't be charged again."),
      confirmLabel: t("billing.cancelSub", "Cancel subscription"),
      cancelLabel: t("billing.keepSub", "Keep subscription"),
      onConfirm: async () => {
        try {
          await cancelAutoRenew({ workspaceId }).unwrap();
          notify.success(t("billing.cancelSubDone", "Subscription cancelled. You won't be charged again."));
        } catch (e) {
          notify.error(errMessage(e, t("billing.cancelSubFailed", "Couldn't cancel the subscription.")));
        }
      },
    });
}
