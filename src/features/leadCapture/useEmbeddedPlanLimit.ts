import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { notify, type QuotaLimitInfo } from "@/shared/lib/notify";
import { useActivityPanel } from "@/features/activity/ActivityPanelContext";
import { appsPath } from "@/features/integrations/lib/appsPath";
import { LEAD_FORMS_BASE } from "./themeParams";

const UPGRADE = "quantalog:upgrade";
const PLAN_LIMIT = "quantalog:plan-limit";
const OPEN_NOTIFICATIONS = "quantalog:open-notifications";
const OPEN_INTEGRATIONS = "quantalog:open-integrations";

interface FramePlanMessage {
  type: typeof UPGRADE | typeof PLAN_LIMIT | typeof OPEN_NOTIFICATIONS | typeof OPEN_INTEGRATIONS;
  message?: string;
  limit?: QuotaLimitInfo;
  app?: unknown;
}

const APP_ID = /^[a-z0-9-]{1,40}$/;

function connectionsTarget(app: unknown): string {
  return appsPath(typeof app === "string" && APP_ID.test(app) ? app : undefined);
}

function isFramePlanMessage(data: unknown): data is FramePlanMessage {
  const type = (data as { type?: unknown } | null)?.type;
  return type === UPGRADE || type === PLAN_LIMIT || type === OPEN_NOTIFICATIONS || type === OPEN_INTEGRATIONS;
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
        openActivityPanel();
        return;
      }
      if (event.data.type === OPEN_INTEGRATIONS) {
        navigate(connectionsTarget(event.data.app));
        return;
      }
      notify.quotaLimit(event.data.message ?? "Upgrade your plan to continue.", event.data.limit);
    };

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [navigate, openActivityPanel]);
}
