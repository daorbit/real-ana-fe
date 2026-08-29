import { useEffect, useMemo, useState } from "react";
import { useComputedColorScheme } from "@mantine/core";
import { FolderOpen } from "lucide-react";
import { AppShell } from "@/app/AppShell";
import { EmptyState } from "@/shared/ui/EmptyState";
import { useWorkspace } from "@/features/workspace/context";
import { useAuth } from "@/features/auth/context";
import { leadFormsUrl } from "../themeParams";
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
  useEffect(() => {
    if (isDemo || !active?._id) {
      setFormsToken(null);
      return;
    }
    let cancelled = false;
    api
      .post<{ token: string }>(`/api/workspaces/${active._id}/forms-token`, {})
      .then((res) => {
        if (!cancelled) setFormsToken(res.token);
      })
      .catch(() => {
        // A viewer has no editor role and gets no token — correct, and not an
        // error worth showing: they simply cannot reach payment settings.
        if (!cancelled) setFormsToken(null);
      });
    return () => {
      cancelled = true;
    };
  }, [active?._id, isDemo]);

  // Rebuilt only when the workspace changes: a new src reloads the frame, and
  // doing that on every render would throw away whatever was being edited.
  const src = useMemo(
    () => {
      // A demo session's workspace id is a fixture, not a real workspace the
      // forms app knows — it goes to the sample workspace regardless.
      const workspaceId = isDemo ? DEMO_FORMS_WORKSPACE : active?._id;
      if (!workspaceId) return null;
      const url = leadFormsUrl(`/${workspaceId}/forms`, colorScheme);
      const token = formsToken ? `&wt=${encodeURIComponent(formsToken)}` : "";
      return `${url}&themeRevision=${themeVersion}${token}`;
    },
    [active, isDemo, colorScheme, themeVersion, formsToken],
  );

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
