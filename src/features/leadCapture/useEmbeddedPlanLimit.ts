import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { notify, type QuotaLimitInfo } from "@/shared/lib/notify";
import { useActivityPanel } from "@/features/activity/ActivityPanelContext";
import { settingsPath } from "@/features/auth/components/settings/settingsSections";
import { LEAD_FORMS_BASE } from "./themeParams";

const UPGRADE = "quantalog:upgrade";
const PLAN_LIMIT = "quantalog:plan-limit";
const OPEN_NOTIFICATIONS = "quantalog:open-notifications";
const OPEN_INTEGRATIONS = "quantalog:open-integrations";
const OPEN_PROFILE = "quantalog:open-profile";

interface FramePlanMessage {
  type: typeof UPGRADE | typeof PLAN_LIMIT | typeof OPEN_NOTIFICATIONS | typeof OPEN_INTEGRATIONS | typeof OPEN_PROFILE;
  message?: string;
  limit?: QuotaLimitInfo;
  app?: unknown;
}

const APP_ID = /^[a-z0-9-]{1,40}$/;

function connectionsTarget(app: unknown): string {
  const base = settingsPath("connections");
  return typeof app === "string" && APP_ID.test(app) ? `${base}?app=${app}` : base;
}

function isFramePlanMessage(data: unknown): data is FramePlanMessage {
  const type = (data as { type?: unknown } | null)?.type;
  return (
    type === UPGRADE ||
    type === PLAN_LIMIT ||
    type === OPEN_NOTIFICATIONS ||
    type === OPEN_INTEGRATIONS ||
    type === OPEN_PROFILE
  );
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
      if (event.data.type === OPEN_PROFILE) {
        navigate(settingsPath("profile"));
        return;
      }
      notify.quotaLimit(event.data.message ?? "Upgrade your plan to continue.", event.data.limit);
    };

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [navigate, openActivityPanel]);
}
