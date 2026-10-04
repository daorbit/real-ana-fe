import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Button } from "@mantine/core";
import { Globe, Link2Off, Lock, PlugZap, SearchX, TriangleAlert, Unplug } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { GoogleMark } from "@/shared/ui/GoogleMark";
import { usePermissions } from "@/features/workspace/context";
import { useSearchWidgetsConnect } from "@/features/searchConsole/widgets/searchWidgetsContext";
import type { SearchSource } from "@/features/searchConsole/widgets/useSearchWidgetSource";
import type { SearchFailure } from "@/features/searchConsole/widgets/useSearchWidgetData";
import classes from "@/features/searchConsole/widgets/searchWidgets.module.css";
import { ADD_SITE_PATH } from "@/features/workspace/paths";

const SEARCH_PAGE = "/app/search-visibility";

type Notice = { icon: LucideIcon; title: string; text: string; action?: ReactNode; warn?: boolean };

function LinkAction({ to, label }: { to: string; label: string }) {
  return (
    <Button component={Link} to={to} size="xs" variant="default">
      {label}
    </Button>
  );
}

function useConnectAction(label: string): ReactNode {
  const { canAdmin } = usePermissions();
  const ctx = useSearchWidgetsConnect();
  if (!canAdmin) return null;
  if (!ctx) return <LinkAction to={SEARCH_PAGE} label={label} />;
  return (
    <Button size="xs" variant="default" leftSection={<GoogleMark size={13} />} loading={ctx.connecting} onClick={ctx.connect}>
      {label}
    </Button>
  );
}

export function SearchWidgetNotice({
  source,
  failure,
  empty,
  emptyTitle,
  emptyText,
  compact = false,
  onRetry,
}: {
  source?: SearchSource;
  failure?: SearchFailure | null;
  empty?: boolean;
  emptyTitle?: string;
  emptyText?: string;
  compact?: boolean;
  onRetry?: () => void;
}) {
  const { canAdmin } = usePermissions();
  const connectAction = useConnectAction("Connect Google");
  const reconnectAction = useConnectAction("Reconnect");
  const askAdmin = "Ask a workspace admin to set it up.";

  const retry = onRetry ? <Button size="xs" variant="default" onClick={onRetry}>Try again</Button> : undefined;

  let notice: Notice | null = null;
  if (failure?.kind === "upgrade") {
    notice = { icon: Lock, title: "Not on your plan", text: failure.message, action: <LinkAction to="/app/billing" label="See plans" /> };
  } else if (failure) {
    notice = { icon: TriangleAlert, title: "Couldn't load Google data", text: failure.message, action: retry, warn: true };
  } else if (empty) {
    notice = { icon: SearchX, title: emptyTitle ?? "No search data yet", text: emptyText ?? "New Google properties take a few days to fill in." };
  } else if (source?.kind === "connect") {
    notice = {
      icon: PlugZap,
      title: "Connect Google Search",
      text: canAdmin ? "See clicks, rankings and queries from Google right here." : askAdmin,
      action: connectAction,
    };
  } else if (source?.kind === "reconnect") {
    notice = {
      icon: Unplug,
      title: "Google connection lost",
      text: canAdmin ? source.message || "Reconnect to keep these numbers updating." : askAdmin,
      action: reconnectAction,
      warn: true,
    };
  } else if (source?.kind === "link") {
    notice = {
      icon: Link2Off,
      title: "Link a Search property",
      text: canAdmin ? `Choose which Google property belongs to ${source.siteName}.` : askAdmin,
      action: canAdmin ? <LinkAction to={SEARCH_PAGE} label="Link property" /> : undefined,
    };
  } else if (source?.kind === "no-site") {
    notice = { icon: Globe, title: "Add a website", text: "Search data is shown per website.", action: <LinkAction to={ADD_SITE_PATH} label="Add a site" /> };
  } else if (source?.kind === "not-configured") {
    notice = { icon: SearchX, title: "Search visibility unavailable", text: "Google Search isn't set up on this deployment." };
  } else if (source?.kind === "error") {
    notice = { icon: TriangleAlert, title: "Couldn't check Google", text: "Search visibility status didn't load.", warn: true };
  }

  if (!notice) return null;
  const Icon = notice.icon;

  if (compact) {
    return (
      <div className={classes.notice} data-compact data-tone={notice.warn ? "warn" : undefined}>
        <span className={classes.noticeIcon}><Icon size={15} /></span>
        <span className={classes.compactText}>
          <span className={classes.compactTitle}>{notice.title}</span>
          <span className={classes.compactHint} title={notice.text}>{notice.text}</span>
        </span>
        {notice.action && <span className={classes.noticeAction}>{notice.action}</span>}
      </div>
    );
  }

  return (
    <div className={classes.notice} data-tone={notice.warn ? "warn" : undefined}>
      <span className={classes.noticeIcon}><Icon size={18} /></span>
      <span className={classes.noticeTitle}>{notice.title}</span>
      <span className={classes.noticeText}>{notice.text}</span>
      {notice.action && <span className={classes.noticeAction}>{notice.action}</span>}
    </div>
  );
}
