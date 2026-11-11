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
const OPEN_FORMS = "quantalog:open-forms";
const OPEN_INSIGHTS = "quantalog:open-insights";
const FORMS_PATH = "/app/lead-capture";
const INSIGHTS_PATH = "/app/lead-insights";

interface FramePlanMessage {
  type:
    | typeof UPGRADE
    | typeof PLAN_LIMIT
    | typeof OPEN_NOTIFICATIONS
    | typeof OPEN_INTEGRATIONS
    | typeof OPEN_FORMS
    | typeof OPEN_INSIGHTS;
  message?: string;
  limit?: QuotaLimitInfo;
  app?: unknown;
  form?: unknown;
}

const APP_ID = /^[a-z0-9-]{1,40}$/;
const FORM_ID = /^[a-zA-Z0-9_-]{1,64}$/;

function insightsTarget(form: unknown): string {
  return typeof form === "string" && FORM_ID.test(form) ? `${INSIGHTS_PATH}?form=${form}` : INSIGHTS_PATH;
}

function connectionsTarget(app: unknown): string {
  return appsPath(typeof app === "string" && APP_ID.test(app) ? app : undefined);
}

function isFramePlanMessage(data: unknown): data is FramePlanMessage {
  const type = (data as { type?: unknown } | null)?.type;
  return (
    type === UPGRADE ||
    type === PLAN_LIMIT ||
    type === OPEN_NOTIFICATIONS ||
    type === OPEN_INTEGRATIONS ||
    type === OPEN_FORMS ||
    type === OPEN_INSIGHTS
  );
}


export function useEmbeddedPlanLimit(frameBase: string = LEAD_FORMS_BASE) {
  const navigate = useNavigate();
  const { open: openActivityPanel } = useActivityPanel();
  useEffect(() => {
    const frameOrigin = new URL(frameBase, window.location.href).origin;

    const onMessage = (event: MessageEvent) => {
      if (event.origin !== frameOrigin) return;
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
      if (event.data.type === OPEN_FORMS) {
        navigate(FORMS_PATH);
        return;
      }
      if (event.data.type === OPEN_INSIGHTS) {
        navigate(insightsTarget(event.data.form));
        return;
      }
      notify.quotaLimit(event.data.message ?? "Upgrade your plan to continue.", event.data.limit);
    };

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [navigate, openActivityPanel, frameBase]);
}
