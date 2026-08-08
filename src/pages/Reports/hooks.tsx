import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  useGetReportSchedulesQuery, useSaveReportScheduleMutation,
  useDeleteReportScheduleMutation, useTestReportScheduleMutation,
  useGetSitesQuery, useGetShareQuery,
  useGetWhatsAppStatusQuery, useTestReportWhatsAppMutation,
} from "../../store";
import { notify, errMessage, confirmDelete } from "../../notify";
import { useWorkspace, useActiveBilling, usePermissions } from "../../workspace";
import { useAuth } from "../../auth";
import type { ReportSchedule } from "../../types";
import { emptyDraft, fromSchedule, type Draft } from "./types";
import { EMAIL_RE, TAB_ORDER, nextSendLabel } from "./utils";

/**
 * Everything the page reads, and the actions it can take on a schedule.
 *
 * Split from the dialog's own state because the two have different lifetimes:
 * this lives as long as the page, the draft only as long as the modal is open.
 */
export function useReportsPage() {
  const { t } = useTranslation();
  const { active } = useWorkspace();
  const { user } = useAuth();
  const billing = useActiveBilling();
  // Schedules are `editor` server-side. A viewer keeps the list, the summary
  // and the next-send times — only the controls that would 403 go away.
  const { canEdit } = usePermissions();
  const workspaceId = active?._id ?? "";
  // WhatsApp is delivered to the account owner's own number only, so the
  // profile mobile is both the destination and the precondition.
  const ownerMobile = (user?.mobile ?? "").replace(/[^\d]/g, "");

  const { data, isLoading } = useGetReportSchedulesQuery(workspaceId, { skip: !workspaceId });
  // `currentData` so a workspace switch empties the list rather than briefly
  // offering the previous workspace's sites as report targets.
  const { currentData: sites = [] } = useGetSitesQuery(workspaceId, { skip: !workspaceId });
  const { data: share } = useGetShareQuery(workspaceId, { skip: !workspaceId });
  const { data: wa } = useGetWhatsAppStatusQuery(workspaceId, { skip: !workspaceId });

  // Offered only when the gateway is both configured and actually paired —
  // enabling a channel that cannot send is a promise the product can't keep.
  const waReady = Boolean(wa?.configured && wa.status === "connected");
  /**
   * Two separate reasons the channel can be unavailable, kept apart because
   * they need different words: the gateway being down is temporary and no
   * fault of the user's, while the plan not including it is neither.
   */
  const waEntitled = billing?.whatsappReports ?? false;

  const [save, { isLoading: saving }] = useSaveReportScheduleMutation();
  const [remove] = useDeleteReportScheduleMutation();
  const [sendTest, { isLoading: testing }] = useTestReportScheduleMutation();
  const [sendWaTest] = useTestReportWhatsAppMutation();
  const [testingId, setTestingId] = useState<string | null>(null);

  const schedules = data?.schedules ?? [];
  const mailReady = data?.mailConfigured ?? true;

  const enabled = schedules.filter((s) => s.enabled);
  const nextUp = enabled
    .slice()
    .sort((a, b) => +new Date(a.nextRunAt) - +new Date(b.nextRunAt))[0];
  // Counted across reports, deduped: the same client on two reports is one
  // person receiving mail from you, which is the number that matters.
  const reach = new Set(
    enabled.flatMap((s) => s.recipients.filter((r) => !r.unsubscribed).map((r) => r.email))
  ).size;

  const siteNameFor = (s: ReportSchedule): string => {
    if (!s.siteIds.length) {
      return t("reports.allSitesIn", { workspace: active?.name ?? t("reports.thisWorkspace") });
    }
    const names = s.siteIds
      .map((id) => sites.find((site) => site.siteId === id)?.name)
      .filter(Boolean);
    return names.length ? names.join(", ") : t("reports.siteCount", { count: s.siteIds.length });
  };

  const persist = async (d: Draft, id: string | null) => {
    await save({
      workspaceId,
      id: id ?? undefined,
      name: d.name.trim(),
      siteIds: d.siteIds,
      frequency: d.frequency,
      recipients: d.recipients,
      channels: { email: d.emailChannel, whatsapp: d.whatsappChannel },
      include: { analytics: d.analytics, seo: d.seo, dashboardLink: d.dashboardLink },
      attachXlsx: d.attachXlsx,
      enabled: d.enabled,
    }).unwrap();
  };

  const toggleEnabled = async (s: ReportSchedule) => {
    try {
      await persist({ ...fromSchedule(s), enabled: !s.enabled }, s.id);
      notify.success(s.enabled ? t("reports.pausedToast") : t("reports.resumedToast"));
    } catch (e) {
      notify.error(errMessage(e, t("reports.updateError")));
    }
  };

  const runTest = async (s: ReportSchedule) => {
    setTestingId(s.id);
    try {
      const result = await sendTest({ workspaceId, id: s.id }).unwrap();
      notify.success(
        t("reports.testSentBody", { recipients: result.sentTo.join(", ") }),
        t("reports.testSentTitle"),
      );
    } catch (e) {
      notify.error(errMessage(e, t("reports.testError")));
    } finally {
      setTestingId(null);
    }
  };

  const runWhatsAppTest = async (s: ReportSchedule) => {
    const first = s.phoneRecipients.find((p) => !p.optedOut);
    if (!first) {
      notify.error(t("reports.noWhatsAppNumbers"));
      return;
    }
    setTestingId(s.id);
    try {
      await sendWaTest({ workspaceId, id: s.id, phone: first.phone }).unwrap();
      notify.success(
        t("reports.waTestSentBody", { phone: first.phone }),
        t("reports.waTestSentTitle"),
      );
    } catch (e) {
      notify.error(errMessage(e, t("reports.waTestError")));
    } finally {
      setTestingId(null);
    }
  };

  const destroy = (s: ReportSchedule) => {
    confirmDelete({
      title: t("reports.deleteTitle"),
      body: t("reports.deleteBody", { name: s.name }),
      onConfirm: async () => {
        try {
          await remove({ workspaceId, id: s.id }).unwrap();
          notify.success(t("reports.deletedToast"));
        } catch (e) {
          notify.error(errMessage(e, t("reports.deleteError")));
        }
      },
    });
  };

  return {
    workspaceId, isLoading, schedules, sites, share, wa, mailReady,
    enabled, nextUp, reach, siteNameFor, nextSendLabel,
    waReady, waEntitled, ownerMobile, canEdit,
    saving, testing, testingId,
    persist, toggleEnabled, runTest, runWhatsAppTest, destroy,
  };
}

/**
 * The dialog's draft, its tab, and the validation that ties the two together.
 *
 * `open`/`openEdit` reset the tab as well as the draft, so editing a second
 * report doesn't land on whichever tab the last one was left on.
 */
export function useReportDialog(opts: {
  waEntitled: boolean;
  ownerMobile: string;
  persist: (d: Draft, id: string | null) => Promise<void>;
}) {
  const { t } = useTranslation();
  const [opened, setOpened] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [emailInput, setEmailInput] = useState("");
  const [tab, setTab] = useState<string>(TAB_ORDER[0]);

  const tabIndex = Math.max(0, TAB_ORDER.indexOf(tab));
  const isLastTab = tabIndex === TAB_ORDER.length - 1;

  const openNew = () => {
    setEditingId(null);
    setDraft(emptyDraft());
    setEmailInput("");
    setTab(TAB_ORDER[0]);
    setOpened(true);
  };

  const openEdit = (s: ReportSchedule) => {
    setEditingId(s.id);
    setDraft(fromSchedule(s));
    setEmailInput("");
    setTab(TAB_ORDER[0]);
    setOpened(true);
  };

  const addEmail = () => {
    const email = emailInput.trim().toLowerCase();
    if (!email) return;
    if (!EMAIL_RE.test(email)) {
      notify.error(t("reports.invalidEmail", { email }));
      return;
    }
    if (draft.recipients.includes(email)) {
      setEmailInput("");
      return;
    }
    setDraft({ ...draft, recipients: [...draft.recipients, email] });
    setEmailInput("");
  };

  const removeEmail = (email: string) =>
    setDraft({ ...draft, recipients: draft.recipients.filter((r) => r !== email) });

  const submit = async () => {
    // Each check names its tab: with the fields split across three panels, a
    // message about a control the user cannot currently see reads as the save
    // silently failing. Switch to the tab, then say what is wrong on it.
    const fail = (tabName: string, message: string) => {
      setTab(tabName);
      notify.error(message);
    };

    if (!draft.name.trim()) {
      fail("schedule", t("reports.needName"));
      return;
    }
    if (!draft.analytics && !draft.seo) {
      fail("content", t("reports.needContent"));
      return;
    }
    if (!draft.emailChannel && !draft.whatsappChannel) {
      fail("delivery", t("reports.needChannel"));
      return;
    }
    if (draft.whatsappChannel && !opts.waEntitled) {
      fail("delivery", t("reports.waIsPro"));
      return;
    }
    if (draft.whatsappChannel && !opts.ownerMobile) {
      fail("delivery", t("reports.waNeedsMobile"));
      return;
    }

    try {
      await opts.persist(draft, editingId);
      notify.success(editingId ? t("reports.updatedToast") : t("reports.scheduledToast"));
      setOpened(false);
    } catch (e) {
      notify.error(errMessage(e, t("reports.saveError")));
    }
  };

  return {
    opened, close: () => setOpened(false), openNew, openEdit,
    editingId, draft, setDraft, emailInput, setEmailInput,
    tab, setTab, tabIndex, isLastTab,
    addEmail, removeEmail, submit,
  };
}
