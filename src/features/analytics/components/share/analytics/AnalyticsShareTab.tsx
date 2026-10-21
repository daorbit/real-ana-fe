import { useState } from "react";
import { Button, Skeleton } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { Share2 } from "lucide-react";
import { useGetShareQuery, useSetShareMutation } from "@/app/store";
import { SharePostModal } from "@/features/analytics/components/SharePostModal";
import { useWorkspace } from "@/features/workspace/context";
import { notify, errMessage, confirmDelete } from "@/shared/lib/notify";
import { useSaveRegistration } from "@/shared/ui/SaveBar";
import type { SharePanels } from "@/shared/types";
import { ShareLinkCard } from "../ShareLinkCard";
import { PanelSwitchList, type PanelGroup } from "../PanelSwitchList";
import { PanelCountActions } from "../PanelCountActions";
import { SectionHead } from "../SectionHead";
import { ShareFootnote } from "../ShareFootnote";
import { ShareStartPanel } from "../start/ShareStartPanel";
import { ALL_PANELS, DEFAULT_PANELS, PANEL_GROUPS } from "./panels";
import { PUBLIC_API_BASE, usePublicHeadline } from "./usePublicHeadline";
import classes from "../Share.module.css";

export function AnalyticsShareTab({ workspaceId }: { workspaceId: string }) {
  const { t } = useTranslation();
  const { data, isLoading } = useGetShareQuery(workspaceId);
  const { active } = useWorkspace();
  const [composerOpen, setComposerOpen] = useState(false);
  const [setShare] = useSetShareMutation();
  const [linkBusy, setLinkBusy] = useState(false);
  const [draft, setDraft] = useState<SharePanels | null>(null);

  const enabled = data?.enabled ?? false;
  const token = data?.token ?? null;
  const url = token ? `${window.location.origin}/share/${token}` : "";
  const headline = usePublicHeadline(token, enabled);

  const serverPanels = { ...DEFAULT_PANELS, ...(data?.panels ?? {}) };
  const panels = draft ?? serverPanels;
  const onCount = ALL_PANELS.filter((p) => panels[p.key]).length;
  const dirty = draft !== null && ALL_PANELS.some((p) => draft[p.key] !== serverPanels[p.key]);

  const savePanels = async () => {
    if (!draft) return;
    try {
      await setShare({ workspaceId, enabled: true, panels: draft }).unwrap();
      setDraft(null);
      notify.success(t("share.panelsUpdated"));
    } catch (e) {
      notify.error(errMessage(e, t("share.panelsError")));
    }
  };

  useSaveRegistration("analytics-panels", { dirty, save: savePanels, reset: () => setDraft(null) });

  const runLinkAction = async (body: { rotate?: boolean }, success: () => void, errorKey: string) => {
    setLinkBusy(true);
    try {
      await setShare({ workspaceId, enabled: true, ...body }).unwrap();
      success();
    } catch (e) {
      notify.error(errMessage(e, t(errorKey)));
    } finally {
      setLinkBusy(false);
    }
  };

  const createLink = () => {
    void runLinkAction({}, () => notify.success(t("share.sharingOnBody"), t("share.sharingOn")), "share.sharingError");
  };

  const rotate = () =>
    confirmDelete({
      title: t("share.rotateTitle"),
      confirmLabel: t("share.rotateConfirm"),
      body: <>{t("share.rotateBody")}</>,
      onConfirm: async () => {
        await runLinkAction(
          { rotate: true },
          () => notify.success(t("share.rotateSuccess"), t("share.rotateSuccessTitle")),
          "share.rotateError",
        );
      },
    });

  const groups: PanelGroup<keyof SharePanels>[] = PANEL_GROUPS.map((g) => ({
    heading: t(g.headingKey),
    note: g.noteKey ? t(g.noteKey) : undefined,
    panels: g.panels.map((p) => ({ key: p.key, label: t(`share.panel.${p.key}`), hint: t(`share.panel.${p.key}Hint`) })),
  }));

  if (isLoading) {
    return (
      <div className={classes.stack}>
        <Skeleton height={132} radius="md" />
        <Skeleton height={320} radius="md" />
      </div>
    );
  }

  if (!enabled || !token) {
    return <ShareStartPanel workspace={active?.name ?? ""} busy={linkBusy} onEnable={createLink} />;
  }

  return (
    <div className={classes.stack}>
      <ShareLinkCard
        title={t("share.analyticsLinkTitle")}
        description={t("share.cardLiveDesc")}
        busy={linkBusy}
        url={url}
        views={data?.views ?? 0}
        lastViewedAt={data?.lastViewedAt}
        onReplace={rotate}
        primaryAction={
          <Button
            className={classes.noShrink}
            leftSection={<Share2 size={14} />}
            onClick={() => {
              setComposerOpen(true);
            }}
          >
            {t("share.share")}
          </Button>
        }
      />

      <section>
        <SectionHead
          title={t("share.whatVisitorsSee")}
          description={t("share.whatVisitorsSeeDesc")}
          actions={
            <PanelCountActions
              on={onCount}
              total={ALL_PANELS.length}
              onSetAll={(next) => setDraft(Object.fromEntries(ALL_PANELS.map((p) => [p.key, next])) as SharePanels)}
            />
          }
        />
        <PanelSwitchList groups={groups} values={panels} onToggle={(key, next) => setDraft({ ...panels, [key]: next })} />
      </section>

      <ShareFootnote title={t("share.neverShared")} body={t("share.neverSharedBody")} />

      <SharePostModal
        opened={composerOpen}
        onClose={() => setComposerOpen(false)}
        workspaceId={workspaceId}
        workspace={active?.name ?? ""}
        url={url}
        shareUrl={`${PUBLIC_API_BASE || window.location.origin}/api/share/${token}/preview`}
        rangeLabel={t("share.cardRange")}
        stats={{ visitors: headline.visitors, pageviews: headline.pageviews, live: headline.live }}
      />
    </div>
  );
}
