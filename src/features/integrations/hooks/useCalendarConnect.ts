import { useEffect, useRef, useState } from "react";
import { useDisconnectFormsCalendarMutation, useGetFormsCalendarConnectUrlMutation } from "@/app/store";
import { notify, notifyError } from "@/shared/lib/notify";

const POPUP_NAME = "forms-google-calendar";
const POPUP_FEATURES = "width=520,height=680,menubar=no,toolbar=no";
const WATCH_MS = 600;

export function useCalendarConnect(workspaceId: string, refetch: () => unknown) {
  const [waiting, setWaiting] = useState(false);
  const watcher = useRef<number | undefined>(undefined);
  const [getConnectUrl] = useGetFormsCalendarConnectUrlMutation();
  const [disconnectCalendar, disconnectState] = useDisconnectFormsCalendarMutation();

  useEffect(() => () => window.clearInterval(watcher.current), []);

  const connect = async () => {
    const popup = window.open("", POPUP_NAME, POPUP_FEATURES);
    if (!popup) {
      notify.error("Allow pop-ups for Quantalog to connect Google Calendar.");
      return;
    }
    setWaiting(true);
    try {
      const { url } = await getConnectUrl(workspaceId).unwrap();
      popup.location.href = url;
      window.clearInterval(watcher.current);
      watcher.current = window.setInterval(() => {
        if (!popup.closed) return;
        window.clearInterval(watcher.current);
        setWaiting(false);
        void refetch();
      }, WATCH_MS);
    } catch (e) {
      popup.close();
      setWaiting(false);
      notifyError(e, "Could not start the Google connection.");
    }
  };

  const disconnect = async () => {
    try {
      await disconnectCalendar(workspaceId).unwrap();
      notify.info("Google Calendar disconnected.");
      return true;
    } catch (e) {
      notifyError(e, "Could not disconnect Google Calendar.");
      return false;
    }
  };

  return { connect, disconnect, busy: waiting || disconnectState.isLoading };
}
