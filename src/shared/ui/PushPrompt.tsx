import { useEffect, useState } from "react";
import { useAuth } from "@/features/auth/context";
import { pushSupported } from "@/features/activity/usePush";
import { readPushDismissal } from "./pushPromptDismissal";
import { PushPromptCard } from "./PushPromptCard";

const SHOW_AFTER_MS = 1500;

function canAsk(): boolean {
  return pushSupported() && Notification.permission !== "denied";
}

export function PushPrompt() {
  const { user } = useAuth();
  const [dismissal, setDismissal] = useState(() => readPushDismissal());
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const id = window.setTimeout(() => setReady(true), SHOW_AFTER_MS);
    return () => window.clearTimeout(id);
  }, []);

  if (!user || user.demo || user.impersonating) return null;
  if (!ready || !canAsk()) return null;
  if (dismissal && dismissal.until > Date.now()) return null;

  return <PushPromptCard onDismiss={setDismissal} />;
}
