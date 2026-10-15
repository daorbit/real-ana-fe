import { useEffect, useRef, useState } from "react";
import {
  useDisconnectFormsCalendarMutation,
  useDisconnectFormsSheetsMutation,
  useGetFormsCalendarConnectUrlMutation,
  useGetFormsSheetsConnectUrlMutation,
} from "@/app/store";
import { notify, notifyError } from "@/shared/lib/notify";

export type GoogleKind = "calendar" | "sheets";

const NAMES: Record<GoogleKind, string> = {
  calendar: "Google Calendar",
  sheets: "Google Sheets",
};

const POPUP_FEATURES = "width=520,height=680,menubar=no,toolbar=no";
const WATCH_MS = 600;

export function useGoogleConnect(kind: GoogleKind, workspaceId: string, refetch: () => unknown) {
  const name = NAMES[kind];
  const [waiting, setWaiting] = useState(false);
  const watcher = useRef<number | undefined>(undefined);
  const [getCalendarUrl] = useGetFormsCalendarConnectUrlMutation();
  const [getSheetsUrl] = useGetFormsSheetsConnectUrlMutation();
  const [dropCalendar, calendarDrop] = useDisconnectFormsCalendarMutation();
  const [dropSheets, sheetsDrop] = useDisconnectFormsSheetsMutation();

  useEffect(() => () => window.clearInterval(watcher.current), []);

  const connect = async () => {
    const popup = window.open("", `forms-google-${kind}`, POPUP_FEATURES);
    if (!popup) {
      notify.error(`Allow pop-ups for Quantalog to connect ${name}.`);
      return;
    }
    setWaiting(true);
    try {
      const { url } = await (kind === "sheets" ? getSheetsUrl(workspaceId) : getCalendarUrl(workspaceId)).unwrap();
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
      notifyError(e, `Could not start the ${name} connection.`);
    }
  };

  const disconnect = async () => {
    try {
      await (kind === "sheets" ? dropSheets(workspaceId) : dropCalendar(workspaceId)).unwrap();
      notify.info(`${name} disconnected.`);
      return true;
    } catch (e) {
      notifyError(e, `Could not disconnect ${name}.`);
      return false;
    }
  };

  const dropping = kind === "sheets" ? sheetsDrop.isLoading : calendarDrop.isLoading;
  return { connect, disconnect, busy: waiting || dropping };
}
