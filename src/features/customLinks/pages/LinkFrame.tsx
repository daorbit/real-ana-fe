import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { Link2 } from "lucide-react";
import { AppShell } from "@/app/AppShell";
import { useNavPrefs } from "@/app/shell/navPrefs";
import { settingsPath } from "@/features/auth/components/settings/settingsSections";
import { useWorkspace } from "@/features/workspace/context";
import { EmptyState } from "@/shared/ui/EmptyState";
import { useTitle } from "@/shared/lib/useTitle";
import classes from "@/features/customLinks/components/LinkFrame.module.css";

export default function LinkFrame() {
  const { slug } = useParams<{ slug: string }>();
  const { loading } = useWorkspace();
  const prefs = useNavPrefs();
  const link = prefs.links.find((l) => l.mode === "internal" && l.slug === slug);
  useTitle(link?.label ?? "Link");

  useEffect(() => {
    if (!link) return;
    document.body.dataset.page = "link-frame";
    return () => {
      delete document.body.dataset.page;
    };
  }, [link]);

  if (loading) return <AppShell><div className={classes.frame} /></AppShell>;

  if (!link) {
    return (
      <AppShell>
        <EmptyState
          icon={Link2}
          title="This link isn't available"
          description="It may have been removed or renamed in this workspace's sidebar settings."
          action={{ label: "Manage links", to: settingsPath("sidebar") }}
        />
      </AppShell>
    );
  }

  return (
    <AppShell>
      <iframe
        key={link.url}
        src={link.url}
        title={link.label}
        className={classes.frame}
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-downloads allow-modals"
        allow="clipboard-read; clipboard-write; fullscreen"
        referrerPolicy="strict-origin-when-cross-origin"
      />
    </AppShell>
  );
}
