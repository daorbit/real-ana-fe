import { useState } from "react";
import {
  useGetReportSchedulesQuery, useSaveReportScheduleMutation,
  useDeleteReportScheduleMutation, useTestReportScheduleMutation,
  useGetSitesQuery, useGetShareQuery,
  useGetWhatsAppStatusQuery, useTestReportWhatsAppMutation,
} from "../../store";
import { notify, errMessage, confirmDelete } from "../../notify";
import { useWorkspace } from "../../workspace";
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
  const { active } = useWorkspace();
  const { user } = useAuth();
  const workspaceId = active?._id ?? "";
  // WhatsApp is delivered to the account owner's own number only, so the
  // profile mobile is both the destination and the precondition.
  const ownerMobile = (user?.mobile ?? "").replace(/[^\d]/g, "");

  const { data, isLoading } = useGetReportSchedulesQuery(workspaceId, { skip: !workspaceId });
  const { data: sites = [] } = useGetSitesQuery(workspaceId, { skip: !workspaceId });
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
  const waEntitled = user?.billing?.whatsappReports ?? false;

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
    if (!s.siteIds.length) return `All sites in ${active?.name ?? "this workspace"}`;
    const names = s.siteIds
      .map((id) => sites.find((site) => site.siteId === id)?.name)
      .filter(Boolean);
    return names.length ? names.join(", ") : `${s.siteIds.length} site(s)`;
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
      notify.success(s.enabled ? "Report paused." : "Report resumed.");
    } catch (e) {
      notify.error(errMessage(e, "Could not update the report."));
    }
  };

  const runTest = async (s: ReportSchedule) => {
    setTestingId(s.id);
    try {
      const result = await sendTest({ workspaceId, id: s.id }).unwrap();
      notify.success(`Sent to ${result.sentTo.join(", ")}.`, "Test report sent");
    } catch (e) {
      notify.error(errMessage(e, "Could not send the test report."));
    } finally {
      setTestingId(null);
    }
  };

  const runWhatsAppTest = async (s: ReportSchedule) => {
    const first = s.phoneRecipients.find((p) => !p.optedOut);
    if (!first) {
      notify.error("This report has no active WhatsApp numbers.");
      return;
    }
    setTestingId(s.id);
    try {
      await sendWaTest({ workspaceId, id: s.id, phone: first.phone }).unwrap();
      notify.success(`Sent to +${first.phone}.`, "Test WhatsApp sent");
    } catch (e) {
      notify.error(errMessage(e, "Could not send the WhatsApp test."));
    } finally {
      setTestingId(null);
    }
  };

  const destroy = (s: ReportSchedule) => {
    confirmDelete({
      title: "Delete report",
      body: (
        <>
          "{s.name}" will be deleted and no longer sent to its recipients. This
          cannot be undone.
        </>
      ),
      onConfirm: async () => {
        try {
          await remove({ workspaceId, id: s.id }).unwrap();
          notify.success("Report deleted.");
        } catch (e) {
          notify.error(errMessage(e, "Could not delete the report."));
        }
      },
    });
  };

  return {
    workspaceId, isLoading, schedules, sites, share, wa, mailReady,
    enabled, nextUp, reach, siteNameFor, nextSendLabel,
    waReady, waEntitled, ownerMobile,
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
      notify.error(`"${email}" is not a valid email address.`);
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
      fail("schedule", "Give the report a name so you can tell it apart from the others.");
      return;
    }
    if (!draft.analytics && !draft.seo) {
      fail("content", "Include analytics, SEO, or both — a report of neither is empty.");
      return;
    }
    if (!draft.emailChannel && !draft.whatsappChannel) {
      fail("delivery", "Pick at least one delivery channel.");
      return;
    }
    if (draft.whatsappChannel && !opts.waEntitled) {
      fail("delivery", "WhatsApp delivery is a Pro feature — upgrade, or deliver this report by email.");
      return;
    }
    if (draft.whatsappChannel && !opts.ownerMobile) {
      fail("delivery", "Add your mobile number in Settings before turning on WhatsApp delivery.");
      return;
    }

    try {
      await opts.persist(draft, editingId);
      notify.success(editingId ? "Report updated." : "Report scheduled.");
      setOpened(false);
    } catch (e) {
      notify.error(errMessage(e, "Could not save the report."));
    }
  };

  return {
    opened, close: () => setOpened(false), openNew, openEdit,
    editingId, draft, setDraft, emailInput, setEmailInput,
    tab, setTab, tabIndex, isLastTab,
    addEmail, removeEmail, submit,
  };
}
