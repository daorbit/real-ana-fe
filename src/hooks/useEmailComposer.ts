import { useCallback, useEffect, useMemo, useState } from "react";
import {
  useGetEmailStatusQuery,
  useGetEmailSegmentsQuery,
  useGetEmailTemplatesQuery,
  useGetEmailRecipientsQuery,
  useSendAdminEmailMutation,
  useSendTestEmailMutation,
  usePreviewEmailMutation,
} from "../store";
import { notify, errMessage } from "../notify";
import { parseAddressList } from "../utils/mailAddresses";
import type {
  AdminUser, EmailSegmentId, MailLayout, MailTemplate,
} from "../types";

/**
 * Everything the email composer knows and can do.
 *
 * Split out from the component so the two steps can be rendered independently
 * without either of them owning state the other needs, and so the send/preview
 * rules live in one place rather than being spread through JSX. The component
 * tree below this is presentational: it reads these values and calls these
 * functions.
 */

export type ComposerStep = "audience" | "write";
/** A segment of existing accounts, or a list of addresses typed by hand. */
export type ComposerAudience = "segment" | "custom";
export type ComposerTab = "write" | "preview";

export function useEmailComposer({
  opened,
  onClose,
  user,
}: {
  opened: boolean;
  onClose: () => void;
  /** Set to address exactly one account; omit for a broadcast. */
  user?: AdminUser | null;
}) {
  const single = Boolean(user);

  const { data: status, isLoading: statusLoading } = useGetEmailStatusQuery(undefined, {
    skip: !opened,
  });
  const { data: segmentData } = useGetEmailSegmentsQuery(undefined, {
    skip: !opened || single,
  });
  const { data: templateData } = useGetEmailTemplatesQuery(undefined, { skip: !opened });

  const [step, setStep] = useState<ComposerStep>("audience");
  const [segment, setSegment] = useState<EmailSegmentId>("not-installed");
  const [audience, setAudience] = useState<ComposerAudience>("segment");
  /** The raw textarea contents. Parsed for display; the server validates again. */
  const [customTo, setCustomTo] = useState("");
  /** Which body layout the server renders. Owned by the chosen template. */
  const [layout, setLayout] = useState<MailLayout>("plain");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  /** The template the draft came from. Null once the copy is edited by hand. */
  const [templateId, setTemplateId] = useState<string | null>(null);
  const [showList, setShowList] = useState(false);
  const [tab, setTab] = useState<ComposerTab>("write");
  // The button under the message. Comes from a template but stays editable —
  // and an empty label or link simply means no button.
  const [ctaLabel, setCtaLabel] = useState("");
  const [ctaHref, setCtaHref] = useState("");
  const [preview, setPreview] = useState<{ html: string; sampleName: string } | null>(null);

  const [sendEmail, { isLoading: sending }] = useSendAdminEmailMutation();
  const [sendTest, { isLoading: testing }] = useSendTestEmailMutation();
  const [renderPreview, { isLoading: previewing }] = usePreviewEmailMutation();

  const { data: recipientData, isFetching: loadingRecipients } = useGetEmailRecipientsQuery(
    segment,
    // A custom list resolves nothing server-side, so the query is skipped rather
    // than fetching a segment nobody is going to send to.
    { skip: !opened || single || audience === "custom" },
  );

  // Both halves or nothing — a labelled button with no target, or a target with
  // no label, is not a button.
  const cta = useMemo(
    () =>
      ctaLabel.trim() && /^https?:\/\//i.test(ctaHref.trim())
        ? { label: ctaLabel.trim(), href: ctaHref.trim() }
        : undefined,
    [ctaLabel, ctaHref],
  );

  const customList = useMemo(() => parseAddressList(customTo), [customTo]);

  const recipients = useMemo(() => {
    if (single && user) return [{ id: user.id, email: user.email, name: user.name }];
    if (audience === "custom")
      return customList.valid.map((r) => ({ id: undefined, email: r.email, name: r.name }));
    return recipientData?.recipients ?? [];
  }, [single, user, audience, customList, recipientData]);

  // A single-user send has no audience step to return to. A stale custom list
  // from a previous open is the kind of thing that mails the wrong people, so
  // the audience resets with the modal.
  useEffect(() => {
    if (!opened) return;
    setStep(single ? "write" : "audience");
    setTab("write");
    setAudience("segment");
    setCustomTo("");
    setLayout("plain");
    setTemplateId(null);
  }, [opened, single]);

  // Re-render the preview while it's on screen, debounced so editing the body
  // with the tab open doesn't fire a request per keystroke.
  useEffect(() => {
    if (tab !== "preview" || !body.trim()) return;
    const t = setTimeout(async () => {
      try {
        const r = await renderPreview({
          subject: subject.trim(),
          body: body.trim(),
          userId: user?.id,
          // Most hand-entered recipients are a bare address, so previewing with
          // a made-up name would hide the version almost everyone receives.
          anonymous: audience === "custom" && !single && !customList.valid.some((r) => r.name),
          cta,
          layout,
        }).unwrap();
        setPreview({ html: r.html, sampleName: r.sampleName });
      } catch {
        setPreview(null);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [tab, subject, body, user?.id, audience, single, customList, cta, layout, renderPreview]);

  const templates = templateData?.templates ?? [];
  const busy = sending || testing;

  const canSend = Boolean(
    status?.configured && subject.trim() && body.trim() && recipients.length,
  );

  /**
   * Whether the audience step will let you continue.
   *
   * A malformed address is a bounce and a small hit to sender reputation, so it
   * is fixed here rather than discovered on send.
   */
  const canAdvance = recipients.length > 0 && customList.invalid.length === 0;

  /** Apply a template: its copy, its button, and its layout. */
  const applyTemplate = useCallback((t: MailTemplate) => {
    setSubject(t.subject);
    setBody(t.body);
    setCtaLabel(t.cta?.label ?? "");
    setCtaHref(t.cta?.href ?? "");
    // The layout belongs to the template, not the author — the invite's feature
    // list only makes sense with the invite's own copy.
    setLayout(t.layout ?? "plain");
    setTemplateId(t.id);
  }, []);

  /**
   * Which template the current draft came from, if any.
   *
   * Cleared as soon as the subject or body is edited: once the copy has been
   * changed, showing a template as selected would claim the draft is something
   * it no longer is. This is why the flag is dropped in the setters below rather
   * than compared against the template text on every render.
   */
  const editSubject = useCallback((v: string) => {
    setSubject(v);
    setTemplateId(null);
  }, []);

  const editBody = useCallback((v: string) => {
    setBody(v);
    setTemplateId(null);
  }, []);

  const close = useCallback(() => {
    if (busy) return;
    onClose();
  }, [busy, onClose]);

  const send = useCallback(async () => {
    try {
      const result = await sendEmail({
        subject: subject.trim(),
        body: body.trim(),
        // Addresses and account ids are different things to the server, and only
        // one of them applies: a custom list has no ids to send.
        ...(audience === "custom" && !single
          ? { emails: customList.valid.map((r) => r.raw) }
          : { userIds: recipients.map((r) => r.id!).filter(Boolean) }),
        cta,
        layout,
      }).unwrap();

      if (result.failed) {
        notify.error(
          `Sent to ${result.sent}, but ${result.failed} failed: ${result.failures
            .map((f) => f.email)
            .join(", ")}`,
          "Partly sent",
        );
        return;
      }

      notify.success(
        single
          ? `Message sent to ${recipients[0]?.email}.`
          : `Sent to ${result.sent} recipient${result.sent === 1 ? "" : "s"}.`,
        "Sent",
      );
      setSubject("");
      setBody("");
      setCtaLabel("");
      setCtaHref("");
      setCustomTo("");
      setTemplateId(null);
      onClose();
    } catch (e) {
      notify.error(errMessage(e, "Could not send the message."));
    }
  }, [
    sendEmail, subject, body, audience, single, customList, recipients, cta, layout, onClose,
  ]);

  const test = useCallback(async () => {
    try {
      const r = await sendTest({
        subject: subject.trim(),
        body: body.trim(),
        cta,
        layout,
      }).unwrap();
      notify.success(`Test message sent to ${r.email}.`, "Test sent");
    } catch (e) {
      notify.error(errMessage(e, "Could not send the test."));
    }
  }, [sendTest, subject, body, cta, layout]);

  return {
    // Mode
    single,
    step, setStep,
    tab, setTab,

    // Configuration
    status, statusLoading,

    // Audience
    audience, setAudience,
    segment, setSegment,
    segments: segmentData?.segments ?? [],
    customTo, setCustomTo,
    customList,
    recipients,
    loadingRecipients,
    showList, setShowList,
    canAdvance,

    // Message
    templates,
    applyTemplate,
    templateId,
    subject, setSubject: editSubject,
    body, setBody: editBody,
    layout,

    // Preview
    preview, previewing,

    // Actions
    busy, sending, testing, canSend,
    send, test, close,
  };
}

/** The shape the step components receive. */
export type EmailComposerState = ReturnType<typeof useEmailComposer>;
