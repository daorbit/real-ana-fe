import { useEffect, useRef, useState } from "react";
import {
  useDisconnectFormsCalendarMutation,
  useDisconnectFormsSheetsMutation,
  useGetFormsCalendarConnectUrlMutation,
  useGetFormsSheetsConnectUrlMutation,
} from "@/app/store";
import { confirmDelete, notify, notifyError } from "@/shared/lib/notify";
import { GOOGLE_DISCONNECT_COPY, GOOGLE_NAMES, type GoogleKind } from "../lib/googleApps";

interface GoogleConnectionState {
  connected: boolean;
  email?: string;
}

const POPUP_FEATURES = "width=520,height=680,menubar=no,toolbar=no";
const WATCH_MS = 600;

export function useGoogleConnect(
  kind: GoogleKind,
  workspaceId: string,
  status: GoogleConnectionState | undefined,
  refetch: () => { unwrap: () => Promise<GoogleConnectionState> },
) {
  const name = GOOGLE_NAMES[kind];
  const [waiting, setWaiting] = useState(false);
  const watcher = useRef<number | undefined>(undefined);
  const before = useRef<GoogleConnectionState | undefined>(undefined);
  const [getCalendarUrl] = useGetFormsCalendarConnectUrlMutation();
  const [getSheetsUrl] = useGetFormsSheetsConnectUrlMutation();
  const [dropCalendar, calendarDrop] = useDisconnectFormsCalendarMutation();
  const [dropSheets, sheetsDrop] = useDisconnectFormsSheetsMutation();

  useEffect(() => () => window.clearInterval(watcher.current), []);

  const reportOutcome = async () => {
    const previous = before.current;
    const next = await refetch()
      .unwrap()
      .catch(() => null);
    if (!next) return;
    if (!next.connected) {
      notify.info(`${name} was not connected. If Google showed an error, try again.`);
    } else if (!previous?.connected) {
      notify.success(`${name} connected.`);
    } else if (next.email && next.email !== previous.email) {
      notify.success(`${name} now uses ${next.email}.`);
    }
  };

  const connect = async () => {
    const popup = window.open("", `forms-google-${kind}`, POPUP_FEATURES);
    if (!popup) {
      notify.error(`Allow pop-ups for Quantalog to connect ${name}.`);
      return;
    }
    before.current = status;
    setWaiting(true);
    try {
      const { url } = await (kind === "sheets" ? getSheetsUrl(workspaceId) : getCalendarUrl(workspaceId)).unwrap();
      popup.location.href = url;
      window.clearInterval(watcher.current);
      watcher.current = window.setInterval(() => {
        if (!popup.closed) return;
        window.clearInterval(watcher.current);
        setWaiting(false);
        void reportOutcome();
      }, WATCH_MS);
    } catch (e) {
      popup.close();
      setWaiting(false);
      notifyError(e, `Could not start the ${name} connection.`);
    }
  };

  const disconnect = (onDone: () => void) => {
    confirmDelete({
      title: `Disconnect ${name}?`,
      body: GOOGLE_DISCONNECT_COPY[kind],
      confirmLabel: "Disconnect",
      onConfirm: async () => {
        try {
          await (kind === "sheets" ? dropSheets(workspaceId) : dropCalendar(workspaceId)).unwrap();
          notify.info(`${name} disconnected.`);
          onDone();
        } catch (e) {
          notifyError(e, `Could not disconnect ${name}.`);
        }
      },
    });
  };

  const dropping = kind === "sheets" ? sheetsDrop.isLoading : calendarDrop.isLoading;
  return { connect, disconnect, busy: waiting || dropping };
}
