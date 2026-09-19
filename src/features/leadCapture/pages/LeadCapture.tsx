import { useEffect, useMemo, useState } from "react";
import { useComputedColorScheme } from "@mantine/core";
import { FolderOpen } from "lucide-react";
import { AppShell } from "@/app/AppShell";
import { EmptyState } from "@/shared/ui/EmptyState";
import { useWorkspace } from "@/features/workspace/context";
import { useAuth } from "@/features/auth/context";
import { leadFormsUrl, LEAD_FORMS_BASE } from "../themeParams";
import { useEmbeddedPlanLimit } from "../useEmbeddedPlanLimit";
import "./LeadCapture.css";
import { useTitle } from "@/shared/lib/useTitle";
import { api } from "@/shared/lib/http";


const DEMO_FORMS_WORKSPACE = "default";

export default function LeadCapture() {
  useTitle("Lead capture");
  const { active } = useWorkspace();
  const { isDemo } = useAuth();
  const [themeVersion, setThemeVersion] = useState(0);
  const colorScheme = useComputedColorScheme("light");
  useEffect(() => {
    document.body.dataset.page = "lead-capture";
    return () => {
      delete document.body.dataset.page;
    };
  }, []);

  useEffect(() => {
    const refresh = () => setThemeVersion((version) => version + 1);
    window.addEventListener("quantalog-theme-change", refresh);
    return () => window.removeEventListener("quantalog-theme-change", refresh);
  }, []);


  const workspaceId = isDemo ? null : active?._id;


  const [bootToken, setBootToken] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!workspaceId) return;
    let cancelled = false;
    setBootToken(undefined);
    api
      .post<{ token: string }>(`/api/workspaces/${workspaceId}/forms-token`, {})
      .then((res) => {
        if (!cancelled) setBootToken(res.token);
      })
      .catch(() => {
        // A viewer has no editor role and gets no token. The frame still loads
        // — it is only the payment screens that need one, and they report the
        // refusal themselves.
        if (!cancelled) setBootToken("");
      });
    return () => {
      cancelled = true;
    };
  }, [workspaceId]);

  useEffect(() => {
    if (!workspaceId) return;
    function onMessage(event: MessageEvent) {
      if (event.data?.type !== "quantalog:workspace-token-request") return;
      const frame = event.source as Window | null;
      if (!frame) return;
      api
        .post<{ token: string }>(`/api/workspaces/${workspaceId}/forms-token`, {})
        .then((res) => {
          // Targeted at the forms app's own origin rather than "*": this is a
          // credential, and it goes to the frame that asked for it, nobody else.
          frame.postMessage(
            { type: "quantalog:workspace-token", token: res.token },
            LEAD_FORMS_BASE,
          );
        })
        .catch(() => {
          // A viewer has no editor role and gets no token. Answering with an
          // empty one lets the frame stop waiting and say so, rather than
          // hanging until its own timeout.
          frame.postMessage(
            { type: "quantalog:workspace-token", token: "" },
            LEAD_FORMS_BASE,
          );
        });
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [workspaceId]);

  // Rebuilt only when the workspace changes: a new src reloads the frame, and
  // doing that on every render would throw away whatever was being edited.
  const src = useMemo(
    () => {
      // A demo session's workspace id is a fixture, not a real workspace the
      // forms app knows — it goes to the sample workspace regardless.
      const frameWorkspace = isDemo ? DEMO_FORMS_WORKSPACE : active?._id;
      if (!frameWorkspace) return null;
      // A demo session has no real workspace and mints no token, so it never
      // waits for one. Otherwise hold until the mint settles: loading the frame
      // first only means its opening request is refused and repeated.
      if (!isDemo && bootToken === undefined) return null;
      const url = leadFormsUrl(
        `/${frameWorkspace}/forms`,
        colorScheme,
        isDemo ? undefined : bootToken,
      );
      return `${url}&themeRevision=${themeVersion}`;
    },
    [active, isDemo, colorScheme, themeVersion, bootToken],
  );
 

  if (!isDemo && !active?._id) {
    return (
      <AppShell>
        <EmptyState
          icon={FolderOpen}
          title="No workspace selected"
          description="Pick a workspace from the switcher to build and manage its lead forms."
          action={{ label: "Go to workspaces", to: "/app/workspaces" }}
        />
      </AppShell>
    );
  }

  if (!src) return <AppShell><div className="lead-capture__frame" /></AppShell>;

  return (
    <AppShell>
      <LeadCaptureFrame src={src} />
    </AppShell>
  );
}

 
function LeadCaptureFrame({ src }: { src: string }) {
  useEmbeddedPlanLimit();
  return (
    <iframe
      key={src}
      src={src}
      title="Lead forms"
      className="lead-capture__frame"
      allow="clipboard-write"
    />
  );
}
