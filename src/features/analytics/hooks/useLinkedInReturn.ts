import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { notify } from "@/shared/lib/notify";
import { api } from "@/app/store/api";

/**
 * Report the outcome of a LinkedIn OAuth round-trip, once.
 *
 * The callback runs on the API origin and finishes by redirecting the browser
 * back here with `?linkedin=<status>`, because a redirect is the only channel a
 * top-level navigation leaves open — there is no fetch whose response the app
 * could have read instead.
 *
 * The parameters are stripped from the URL immediately after being read, so a
 * refresh or a shared link does not replay the toast.
 */
export function useLinkedInReturn() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  // Effects run twice under StrictMode in development; this keeps that from
  // showing the notification twice.
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;

    const params = new URLSearchParams(window.location.search);
    const status = params.get("linkedin");
    if (!status) return;

    handled.current = true;

    // When the flow ran in a popup, this code is executing *inside* that popup
    // — it landed on the studio because that is where the callback redirects.
    // Hand the outcome to the window that opened it and close, so the Share
    // Panel updates in place with its caption and card untouched.
    if (window.opener && window.opener !== window) {
      window.opener.postMessage({ source: "quantalog-linkedin", status }, window.location.origin);
      window.close();
      return;
    }

    if (status === "connected") {
      notify.success(t("sharePost.linkedinConnected"));
      // The status query was fetched before the user left for LinkedIn, so the
      // cached answer still says "not connected" until this invalidation.
      dispatch(api.util.invalidateTags(["LinkedIn"]));
    } else if (status === "cancelled") {
      notify.info(t("sharePost.linkedinConnectCancelled"));
    } else {
      notify.error(t("sharePost.linkedinConnectError"));
    }

    params.delete("linkedin");
    params.delete("reason");
    const query = params.toString();
    window.history.replaceState(
      {},
      "",
      `${window.location.pathname}${query ? `?${query}` : ""}`,
    );
  }, [t, dispatch]);
}
