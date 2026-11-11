import { useEffect, useMemo, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { FolderOpen } from "lucide-react";
import { AppShell } from "@/app/AppShell";
import { EmptyState } from "@/shared/ui/EmptyState";
import { useWorkspace } from "@/features/workspace/context";
import { useAuth } from "@/features/auth/context";
import { useTitle } from "@/shared/lib/useTitle";
import { useHostFrameToken } from "@/shared/hooks/useHostFrameToken";
import { useFrameTheme } from "@/shared/hooks/useFrameTheme";
import { leadFormsUrl, LEAD_FORMS_BASE } from "../themeParams";
import { useEmbeddedPlanLimit } from "../useEmbeddedPlanLimit";
import { useFrameUnreadCount } from "../useFrameUnreadCount";
import { useFrameRailCollapse } from "../useFrameRailCollapse";
import "../pages/LeadCapture.css";

const DEMO_FORMS_WORKSPACE = "default";
const FORM_ID = /^[a-zA-Z0-9_-]{1,64}$/;

export function FormsFramePage({ title, path, frameTitle }: { title: string; path: string; frameTitle: string }) {
  useTitle(title);
  const { active } = useWorkspace();
  const { isDemo } = useAuth();

  useEffect(() => {
    document.body.dataset.page = "lead-capture";
    return () => {
      delete document.body.dataset.page;
    };
  }, []);

  const workspaceId = isDemo ? null : active?._id;
  useHostFrameToken(workspaceId, "forms-token", LEAD_FORMS_BASE);

  const [params] = useSearchParams();
  const formParam = params.get("form");
  const formFilter = formParam && FORM_ID.test(formParam) ? formParam : null;

  const src = useMemo(() => {
    const frameWorkspace = isDemo ? DEMO_FORMS_WORKSPACE : active?._id;
    if (!frameWorkspace) return null;
    return leadFormsUrl(`/${frameWorkspace}${path}`, formFilter ? { form: formFilter } : undefined);
  }, [active?._id, isDemo, path, formFilter]);

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
      <FormsFrame src={src} title={frameTitle} />
    </AppShell>
  );
}

function FormsFrame({ src, title }: { src: string; title: string }) {
  useEmbeddedPlanLimit();
  useFrameRailCollapse();
  const frameRef = useRef<HTMLIFrameElement>(null);
  const sendUnreadCount = useFrameUnreadCount(frameRef);
  const sendTheme = useFrameTheme(frameRef, LEAD_FORMS_BASE);
  return (
    <iframe
      ref={frameRef}
      key={src}
      src={src}
      title={title}
      className="lead-capture__frame"
      allow="clipboard-write"
      onLoad={() => {
        sendUnreadCount();
        sendTheme();
      }}
    />
  );
}
