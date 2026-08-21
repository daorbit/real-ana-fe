import { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { notify } from "@/shared/lib/notify";
import { api } from "@/app/store/api";

/**
 * Report the outcome of an Instagram OAuth round-trip, once.
 *
 * Only reached when the flow ran as a full-page navigation, which happens when
 * the popup was blocked: the popup path reports to its opener and closes itself
 * without ever loading the studio. A redirect carrying the status is the only
 * channel a top-level navigation leaves open — there is no fetch whose response
 * the app could have read instead.
 *
 * The parameters are stripped from the URL immediately after being read, so a
 * refresh or a shared link does not replay the toast.
 */

/** Kept in step with the server's `REASON_TEXT`, which the popup renders. */
const REASON_TEXT: Record<string, string> = {
  not_signed_in: "Your session could not be verified. Sign in again, then retry connecting Instagram.",
  not_configured:
    "Instagram is not set up on this deployment yet. Ask an administrator to add the credentials.",
  demo: "Instagram cannot be connected from a demo session.",
  invalid_state: "That connection attempt expired. Please try again.",
  missing_code: "Instagram did not return an authorisation code. Please try again.",
  instagram_failed: "Instagram could not complete the connection. Please try again.",
  save_failed: "The connection could not be saved. Please try again.",
  no_publish: "Posting permission was not granted. Reconnect and allow publishing to continue.",
  already_connected: "That Instagram account is already connected to a different Quantalog account.",
  not_professional:
    "Only Instagram Business or Creator accounts can be connected. Switch your account type in the Instagram app, then try again.",
};

export function useInstagramReturn() {
  const dispatch = useDispatch();
  // Effects run twice under StrictMode in development; this keeps that from
  // showing the notification twice.
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;

    const params = new URLSearchParams(window.location.search);
    const status = params.get("instagram");
    if (!status) return;

    handled.current = true;
    const reason = params.get("reason") ?? "";

    if (status === "connected") {
      notify.success("Instagram connected");
      // The status query was fetched before the user left for Instagram, so the
      // cached answer still says "not connected" until this invalidation.
      dispatch(api.util.invalidateTags(["Instagram"]));
    } else if (status === "cancelled") {
      notify.info("Instagram connection cancelled");
    } else {
      notify.error(REASON_TEXT[reason] ?? "Could not connect Instagram. Please try again.");
    }

    params.delete("instagram");
    params.delete("reason");
    const query = params.toString();
    window.history.replaceState(
      {},
      "",
      `${window.location.pathname}${query ? `?${query}` : ""}`,
    );
  }, [dispatch]);
}
