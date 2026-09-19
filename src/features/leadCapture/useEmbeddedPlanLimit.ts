import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { notify, type QuotaLimitInfo } from "@/shared/lib/notify";
import { useActivityPanel } from "@/features/activity/ActivityPanelContext";
import { LEAD_FORMS_BASE } from "./themeParams";

const UPGRADE = "quantalog:upgrade";
const PLAN_LIMIT = "quantalog:plan-limit";
const OPEN_NOTIFICATIONS = "quantalog:open-notifications";

interface FramePlanMessage {
  type: typeof UPGRADE | typeof PLAN_LIMIT | typeof OPEN_NOTIFICATIONS;
  message?: string;
  limit?: QuotaLimitInfo;
}

function isFramePlanMessage(data: unknown): data is FramePlanMessage {
  const type = (data as { type?: unknown } | null)?.type;
  return type === UPGRADE || type === PLAN_LIMIT || type === OPEN_NOTIFICATIONS;
}


export function useEmbeddedPlanLimit() {
  const navigate = useNavigate();
  const { open: openActivityPanel } = useActivityPanel();
  useEffect(() => {
    const formsOrigin = new URL(LEAD_FORMS_BASE, window.location.href).origin;

    const onMessage = (event: MessageEvent) => {
      if (event.origin !== formsOrigin) return;
      if (!isFramePlanMessage(event.data)) return;

      if (event.data.type === UPGRADE) {
        navigate("/app/billing");
        return;
      }
      if (event.data.type === OPEN_NOTIFICATIONS) {
        console.log(event.data.type,OPEN_NOTIFICATIONS,"ajay")
        openActivityPanel();
        return;
      }
      notify.quotaLimit(event.data.message ?? "Upgrade your plan to continue.", event.data.limit);
    };

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [navigate, openActivityPanel]);
}
