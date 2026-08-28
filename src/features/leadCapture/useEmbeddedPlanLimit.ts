import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { notify, type QuotaLimitInfo } from "@/shared/lib/notify";
import { LEAD_FORMS_BASE } from "./themeParams";

/**
 * What the embedded forms app sends up.
 *
 * It shows its own copy of the upgrade dialog — it has to, since a cross-origin
 * frame cannot open one in this document — so what reaches here is the button
 * press, not the refusal. `plan-limit` stays supported for anything that would
 * rather hand the whole decision to the host.
 */
const UPGRADE = "quantalog:upgrade";
const PLAN_LIMIT = "quantalog:plan-limit";

interface FramePlanMessage {
  type: typeof UPGRADE | typeof PLAN_LIMIT;
  message?: string;
  limit?: QuotaLimitInfo;
}

function isFramePlanMessage(data: unknown): data is FramePlanMessage {
  const type = (data as { type?: unknown } | null)?.type;
  return type === UPGRADE || type === PLAN_LIMIT;
}

/**
 * Open the app's own upgrade dialog when the embedded forms app hits a plan cap.
 *
 * The forms app is a separate origin in an iframe, so its 402s never pass
 * through this app's `baseQuery` — without this, the one place that turns a plan
 * limit into an upgrade dialog simply never sees them, and the frame is left to
 * show its own error. Sending the event up instead keeps one dialog, one billing
 * route, and one look for every cap in the product.
 *
 * The sender's origin is checked against the frame's own base URL: a message
 * from anywhere else is ignored rather than trusted to open a dialog.
 */
export function useEmbeddedPlanLimit() {
  const navigate = useNavigate();

  useEffect(() => {
    const formsOrigin = new URL(LEAD_FORMS_BASE, window.location.href).origin;

    const onMessage = (event: MessageEvent) => {
      if (event.origin !== formsOrigin) return;
      if (!isFramePlanMessage(event.data)) return;

      if (event.data.type === UPGRADE) {
        navigate("/app/billing");
        return;
      }
      notify.quotaLimit(event.data.message ?? "Upgrade your plan to continue.", event.data.limit);
    };

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [navigate]);
}
