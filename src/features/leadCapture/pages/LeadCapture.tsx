import { useEffect, useMemo, useState } from "react";
import { useComputedColorScheme } from "@mantine/core";
import { FolderOpen } from "lucide-react";
import { AppShell } from "@/app/AppShell";
import { EmptyState } from "@/shared/ui/EmptyState";
import { useWorkspace } from "@/features/workspace/context";
import { useAuth } from "@/features/auth/context";
import { leadFormsUrl } from "../themeParams";
import "./LeadCapture.css";

/**
 * The forms app's own read-only workspace: sample forms, an editor to explore,
 * and no way to save. A demo session has no real workspace behind it, so this
 * is what it gets instead of one.
 */
const DEMO_FORMS_WORKSPACE = "default";

export default function LeadCapture() {
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

  // Rebuilt only when the workspace changes: a new src reloads the frame, and
  // doing that on every render would throw away whatever was being edited.
  const src = useMemo(
    () => {
      // A demo session's workspace id is a fixture, not a real workspace the
      // forms app knows — it goes to the sample workspace regardless.
      const workspaceId = isDemo ? DEMO_FORMS_WORKSPACE : active?._id;
      if (!workspaceId) return null;
      const url = leadFormsUrl(`/${workspaceId}/forms`, colorScheme);
      return `${url}&themeRevision=${themeVersion}`;
    },
    [active, isDemo, colorScheme, themeVersion],
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
