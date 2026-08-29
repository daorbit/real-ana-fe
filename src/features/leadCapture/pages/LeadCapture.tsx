import { useEffect, useMemo, useState } from "react";
import { useComputedColorScheme, Center, Loader } from "@mantine/core";
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

/**
 * The forms app's own read-only workspace: sample forms, an editor to explore,
 * and no way to save. A demo session has no real workspace behind it, so this
 * is what it gets instead of one.
 */
const DEMO_FORMS_WORKSPACE = "default";

export default function LeadCapture() {
  useTitle("Lead capture");
  const { active } = useWorkspace();
  const { isDemo } = useAuth();
  const [themeVersion, setThemeVersion] = useState(0);
  const colorScheme = useComputedColorScheme("light");
  useEmbeddedPlanLimit();
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

  /**
   * Proof for the forms app that this session may act for the workspace.
   *
   * A workspace id in an iframe URL says nothing about who is looking at it,
   * and the forms app needs more than that before it will hand over or change
   * the workspace's payment credentials. The session lives here, so the token
   * is minted here and travels with the frame.
   *
   * Only the payment settings require it — everything else in the forms app
   * keeps working if this fails, which is why a failure leaves the frame to
   * load rather than blocking it.
   */
  const [formsToken, setFormsToken] = useState<string | null>(null);
  const workspaceId = isDemo ? null : active?._id;

  useEffect(() => {
    if (!workspaceId) {
      setFormsToken(null);
      return;
    }
    let cancelled = false;
    api
      .post<{ token: string }>(`/api/workspaces/${workspaceId}/forms-token`, {})
      .then((res) => {
        if (!cancelled) setFormsToken(res.token);
      })
      .catch(() => {
        // A viewer has no editor role and gets no token — correct, and not an
        // error worth showing: they simply cannot reach the forms app's
        // workspace routes.
        if (!cancelled) setFormsToken(null);
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
          setFormsToken(res.token);
          frame.postMessage(
            { type: "quantalog:workspace-token", token: res.token },
            LEAD_FORMS_BASE,
          );
        })
        .catch(() => {
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
      // The frame waits for its token: loading without one would leave the
      // forms app making calls it cannot authorise, and every one of them
      // would fail before the token arrived.
      if (!isDemo && !formsToken) return null;
      const url = leadFormsUrl(`/${frameWorkspace}/forms`, colorScheme);
      const token = formsToken ? `&wt=${encodeURIComponent(formsToken)}` : "";
      return `${url}&themeRevision=${themeVersion}${token}`;
    },
 
    [active, isDemo, colorScheme, themeVersion, formsToken === null],
  );
 
  if (!src && workspaceId) {
    return (
      <AppShell>
        <Center h="60vh">
          <Loader size="sm" />
        </Center>
      </AppShell>
    );
  }

  if (!src) {
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

  return (
    <AppShell>
      <iframe
        key={src}
        src={src}
        title="Lead forms"
        className="lead-capture__frame"
        allow="clipboard-write"
      />
    </AppShell>
  );
}
