import { useCallback, useEffect, useRef, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import {
  Text, Group, TextInput, Button, Avatar, Badge, Select, Box, Code, Tabs,
} from "@mantine/core";
import { Save, Trash2, Undo2, Upload, UserRound, Palette, Link2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { AppShell } from "@/app/AppShell";
import { PageHeader, PageStack, Section, Field } from "@/shared/ui/Page";
import AvatarCropper from "@/shared/ui/AvatarCropper";
import { AppearanceSection } from "@/features/auth/components/AppearanceSection";
import { LinkedInConnection } from "@/features/analytics/components/LinkedInConnection";
import { InstagramConnection } from "@/features/social/components/InstagramConnection";
import { useInstagramReturn } from "@/features/social/useInstagramReturn";
import {
  FACEBOOK_BLUE, FacebookMark, INSTAGRAM_PINK, InstagramMark, LINKEDIN_BLUE, LinkedInMark,
} from "@/shared/ui/LinkedInMark";
import { useAuth } from "@/features/auth/context";
import { useUnsavedGuard } from "@/shared/hooks";
import { notify, errMessage } from "@/shared/lib/notify";
import { trace } from "@/shared/lib/analytics";

/**
 * Date formats, previewed rather than named.
 *
 * "en-GB" means nothing to most people; "18 Jul 2026" is immediately legible,
 * so the sample is the label and the tag is the supporting detail.
 */
const LOCALES = [
  { value: "", label: "Match my browser" },
  { value: "en-GB", label: "18 Jul 2026 · English (UK)" },
  { value: "en-US", label: "Jul 18, 2026 · English (US)" },
  { value: "en-IN", label: "18 Jul 2026 · English (India)" },
  { value: "de-DE", label: "18. Juli 2026 · German" },
  { value: "fr-FR", label: "18 juil. 2026 · French" },
  { value: "es-ES", label: "18 jul 2026 · Spanish" },
  { value: "ja-JP", label: "2026年7月18日 · Japanese" },
];

const TIMEZONES = [
  { value: "", label: "Match my browser" },
  { value: "UTC", label: "UTC" },
  { value: "Asia/Kolkata", label: "Asia/Kolkata (IST)" },
  { value: "Asia/Dubai", label: "Asia/Dubai" },
  { value: "Asia/Singapore", label: "Asia/Singapore" },
  { value: "Europe/London", label: "Europe/London" },
  { value: "Europe/Berlin", label: "Europe/Berlin" },
  { value: "America/New_York", label: "America/New_York" },
  { value: "America/Chicago", label: "America/Chicago" },
  { value: "America/Los_Angeles", label: "America/Los_Angeles" },
  { value: "Australia/Sydney", label: "Australia/Sydney" },
];

const BROWSER_LOCALE = (() => {
  try {
    return new Intl.DateTimeFormat().resolvedOptions().locale || null;
  } catch {
    return null;
  }
})();

const BROWSER_TZ = (() => {
  try {
    return new Intl.DateTimeFormat().resolvedOptions().timeZone || null;
  } catch {
    return null;
  }
})();

 
function ConnectionCard({
  mark,
  tint,
  name,
  hint,
  soon,
  children,
}: {
  mark: ReactNode;
  tint: string;
  name: string;
  hint: string;
  soon?: boolean;
  children?: ReactNode;
}) {
  return (
    <Box className="connection-card" style={{ opacity: soon ? 0.55 : 1 }}>
      <Box
        aria-hidden
        className="connection-card__mark"
        style={{
          // The network's own colour at low alpha, so the mark sits on a tint
          // of itself rather than on one shared grey for all of them.
          background: `color-mix(in srgb, ${tint} 16%, transparent)`,
        }}
      >
        {mark}
      </Box>

      <Group gap={8} wrap="nowrap" align="center" mt="md">
        <Text fw={600}>{name}</Text>
        {soon && <Badge size="xs" variant="light" color="gray">Coming soon</Badge>}
      </Group>
      <Text size="sm" c="dimmed" mt={4} style={{ flex: 1 }}>{hint}</Text>

      {/* The action sits at the foot of every card at the same height, so the
          row reads as a set of equivalent choices rather than three blocks of
          text with a control somewhere inside each. */}
      <Box mt="md">{children}</Box>
    </Box>
  );
}

/**
 * Validators return an i18n key (or null), not a finished message, so the error
 * shown under a field follows the interface language like everything else. The
 * caller runs the key through `t()`.
 */

/** A phone number people actually type: digits, spaces, +, -, (), 6–20 long. */
function mobileError(v: string): string | null {
  const s = v.trim();
  if (!s) return null;
  if (!/^\+?[\d\s\-()]{6,20}$/.test(s)) return "settings.badPhone";
  return null;
}

export default function Settings() {
  const { t } = useTranslation();
  // Where a popup-blocked Instagram flow lands, with its outcome in the query
  // string. Reads it once, raises the toast, and clears the parameters.
  useInstagramReturn();
  const { user, updateProfile, uploadAvatar, removeAvatar } = useAuth();
  const fileInput = useRef<HTMLInputElement | null>(null);
  const [avatarBusy, setAvatarBusy] = useState(false);
  /** The picked file awaiting a crop. Non-null opens the cropper. */
  const [cropFile, setCropFile] = useState<File | null>(null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [mobile, setMobile] = useState("");
  // The avatar is not a form field: it is saved by its own endpoints the moment
  // it changes, so it is read straight off the session rather than mirrored into
  // local state that a later Save could write back stale.
  const avatarUrl = user?.avatarUrl ?? "";
  const [dateLocale, setDateLocale] = useState("");
  const [timezone, setTimezone] = useState("");
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [saving, setSaving] = useState(false);
  const [avatarBroken, setAvatarBroken] = useState(false);

  // A new URL deserves a fresh attempt: without this, one image that failed to
  // load would keep every later upload hidden behind the initials fallback.
  useEffect(() => {
    setAvatarBroken(false);
  }, [avatarUrl]);

  // Clear a field's error the moment its value becomes valid, rather than
  // leaving stale red text sitting under a field the user has already fixed and
  // is waiting on the next Save to acknowledge.
  const clearIfValid = (key: string, check: (v: string) => string | null, v: string) => {
    setErrors((prev) => (prev[key] && !check(v) ? { ...prev, [key]: null } : prev));
  };

  // Also used by Discard, which is exactly "put every field back to the saved
  // profile" — the same operation as the initial seed.
  const seedFromUser = useCallback(() => {
    if (!user) return;
    setFirstName(user.firstName ?? "");
    setLastName(user.lastName ?? "");
    setMobile(user.mobile ?? "");
    setDateLocale(user.dateLocale ?? "");
    setTimezone(user.timezone ?? "");
    setErrors({});
    setAvatarBroken(false);
  }, [user]);

  // Seed from the session once it is known, and re-seed if the session changes
  // underneath us (an admin entering or leaving an impersonation).
  //
  // Deliberately keyed on identity rather than on `seedFromUser`: the callback
  // changes whenever the user object does, including right after a save, and
  // depending on it would re-seed the form mid-edit.
  useEffect(() => {
    seedFromUser();
  }, [user?.id, user?.impersonating]);

  const dirty =
    !!user &&
    (firstName !== (user.firstName ?? "") ||
      lastName !== (user.lastName ?? "") ||
      mobile !== (user.mobile ?? "") ||
      dateLocale !== (user.dateLocale ?? "") ||
      timezone !== (user.timezone ?? ""));

  // A profile edit is quick to make and easy to walk away from — closing the
  // tab or clicking a nav link would otherwise drop it silently.
  useUnsavedGuard(dirty, t("settings.unsavedGuard"));

  // Esc discards the pending edit — the keyboard twin of the Discard button, so
  // you can back out without reaching for the mouse. Skipped while a dropdown is
  // open (Esc closes that first) and while saving (nothing to safely revert).
  useEffect(() => {
    if (!dirty || saving) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (document.querySelector('[role="listbox"]')) return;
      e.preventDefault();
      seedFromUser();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dirty, saving, seedFromUser]);

  // Preview the pending selection, not the saved one — otherwise the sample
  // contradicts the dropdown until you hit save.
  const preview = (() => {
    try {
      return new Date().toLocaleString(dateLocale || undefined, {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        timeZone: timezone || undefined,
      });
    } catch {
      return "—";
    }
  })();

  const submit = async (e: FormEvent) => {
    e.preventDefault();

    const next: Record<string, string | null> = {
      firstName: firstName.trim() ? null : "settings.firstNameRequired",
      mobile: mobileError(mobile),
    };
    setErrors(next);
    if (Object.values(next).some(Boolean)) return;

    trace(user?.id, "profile_saved", "settings", "profile");
    setSaving(true);
    try {
      await updateProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        mobile: mobile.trim(),
        // `avatarUrl` is deliberately absent: the picture is managed by its own
        // upload/remove endpoints, which save immediately. Sending it here would
        // PATCH whatever this form last held, undoing an upload made since.
        dateLocale,
        timezone,
      });
      notify.success(t("settings.savedToast"), t("common.saved"));
    } catch (err) {
      notify.error(errMessage(err, t("settings.saveError")));
    } finally {
      setSaving(false);
    }
  };

  /**
   * Open the cropper on the picked file.
   *
   * Nothing is uploaded here — the crop is confirmed first, so what gets stored
   * is what the user framed rather than the raw camera roll photo.
   */
  const pickAvatar = (file: File | null) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      notify.error(t("settings.avatarNotImage"));
      return;
    }
    setCropFile(file);
    // Clear the input now, so re-picking the same file after a cancel still
    // fires a change event.
    if (fileInput.current) fileInput.current.value = "";
  };

  /**
   * Upload the cropped square.
   *
   * Deliberately outside the form's save cycle: the picture is stored the moment
   * it is confirmed, so the avatar beside it updates immediately and there is no
   * uploaded file left unreferenced if the user leaves without saving. The URL
   * field is re-seeded from the new user, keeping the form undirty.
   */
  const saveCrop = async (cropped: Blob) => {
    trace(user?.id, "avatar_uploaded", "settings", "profile");
    setAvatarBusy(true);
    try {
      await uploadAvatar(cropped);
      setAvatarBroken(false);
      setCropFile(null);
      notify.success(t("settings.avatarUploaded"), t("common.saved"));
    } catch (err) {
      notify.error(errMessage(err, t("settings.avatarUploadError")));
    } finally {
      setAvatarBusy(false);
    }
  };

  const clearAvatar = async () => {
    trace(user?.id, "avatar_removed", "settings", "profile");
    setAvatarBusy(true);
    try {
      await removeAvatar();
      setAvatarBroken(false);
      notify.success(t("settings.avatarRemoved"), t("common.saved"));
    } catch (err) {
      notify.error(errMessage(err, t("settings.avatarRemoveError")));
    } finally {
      setAvatarBusy(false);
    }
  };

  // Errors are stored as i18n keys; resolve to the current language at render.
  const errText = (key: string | null | undefined) => (key ? t(key) : undefined);

  if (!user) return null;

  const initials =
    `${firstName} ${lastName}`.trim().slice(0, 2).toUpperCase() ||
    user.name.slice(0, 2).toUpperCase();

  return (
    <AppShell>
      <form onSubmit={submit}>
        <PageHeader
          title={t("settings.title")}
          description={t("settings.description")}
          actions={
            <Button
              type="submit"
              leftSection={<Save size={15} />}
              loading={saving}
              disabled={!dirty}
            >
              {t("common.save")}
            </Button>
          }
        />

        <Tabs defaultValue="info" keepMounted={false}>
          <Tabs.List mb="xl">
            <Tabs.Tab value="info" leftSection={<UserRound size={15} />}>
              {t("settings.tabInfo", "Info")}
            </Tabs.Tab>
            <Tabs.Tab value="appearance" leftSection={<Palette size={15} />}>
              {t("settings.tabAppearance", "Appearance")}
            </Tabs.Tab>
            <Tabs.Tab value="connections" leftSection={<Link2 size={15} />}>
              {t("settings.tabConnections", "Connections")}
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="info">
            <PageStack>
              {/* Identity card — the avatar and name read as a profile rather
                  than as two more text inputs. */}
              <Box className="surface-card" p="lg">
                <Group gap="lg" wrap="nowrap">
                  <Avatar
                    // No URL validation: the value comes from our own Cloudinary
                    // upload or from Google, not from anything typed. `avatarBroken`
                    // still covers a link that stops resolving.
                    src={avatarBroken ? null : avatarUrl || null}
                    color="emerald"
                    radius="md"
                    size={72}
                    imageProps={{ onError: () => setAvatarBroken(true), referrerPolicy: "no-referrer" }}
                  >
                    {initials}
                  </Avatar>
                  <Box style={{ minWidth: 0 }}>
                    <Group gap="xs">
                      <Text fw={700} size="lg" truncate style={{ letterSpacing: "-0.01em" }}>
                        {`${firstName} ${lastName}`.trim() || user.name}
                      </Text>
                      <Badge
                        size="sm"
                        variant="light"
                        color={user.role === "admin" || user.role === "super_admin" ? "grape" : "gray"}
                      >
                        {user.role}
                      </Badge>
                    </Group>
                    <Text size="sm" c="dimmed" truncate>{user.email}</Text>

                    {/* The file input is hidden and driven by the button: a bare
                        input styles inconsistently across browsers and cannot be
                        made to match the rest of the page. */}
                    <input
                      ref={fileInput}
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/gif"
                      hidden
                      onChange={(e) => pickAvatar(e.currentTarget.files?.[0] ?? null)}
                    />
                    <Group gap="xs" mt="sm">
                      <Button
                        size="xs"
                        variant="light"
                        leftSection={<Upload size={14} />}
                        loading={avatarBusy}
                        onClick={() => fileInput.current?.click()}
                      >
                        {avatarUrl ? t("settings.avatarChange") : t("settings.avatarUpload")}
                      </Button>
                      {avatarUrl && (
                        <Button
                          size="xs"
                          variant="subtle"
                          color="red"
                          leftSection={<Trash2 size={14} />}
                          disabled={avatarBusy}
                          onClick={() => void clearAvatar()}
                        >
                          {t("settings.avatarRemove")}
                        </Button>
                      )}
                    </Group>
                  </Box>
                </Group>
              </Box>

              <Section
                title={t("settings.profile")}
                description={t("settings.profileDesc")}
              >
                <Field label={t("settings.firstName")} hint={t("common.required")}>
                  <TextInput
                    value={firstName}
                    onChange={(e) => {
                      const v = e.currentTarget.value;
                      setFirstName(v);
                      clearIfValid("firstName", (s) => (s.trim() ? null : "x"), v);
                    }}
                    error={errText(errors.firstName)}
                  />
                </Field>
                <Field label={t("settings.lastName")}>
                  <TextInput
                    value={lastName}
                    onChange={(e) => setLastName(e.currentTarget.value)}
                  />
                </Field>
                <Field
                  label={t("settings.email")}
                  hint={t("settings.emailHint")}
                >
                  <TextInput value={user.email} disabled />
                </Field>
                <Field label={t("settings.mobile")} hint={t("common.optional")} last>
                  <TextInput
                    placeholder="+91 98765 43210"
                    value={mobile}
                    onChange={(e) => {
                      const v = e.currentTarget.value;
                      setMobile(v);
                      clearIfValid("mobile", mobileError, v);
                    }}
                    error={errText(errors.mobile)}
                  />
                </Field>
              </Section>

              <Section
                title={t("settings.datesTitle")}
                description={t("settings.datesDesc")}
              >
                <Field
                  label={t("settings.dateFormat")}
                  hint={
                    !dateLocale && BROWSER_LOCALE
                      ? t("settings.dateFormatHintDetected", { value: BROWSER_LOCALE })
                      : t("settings.dateFormatHint")
                  }
                >
                  <Select
                    data={LOCALES}
                    value={dateLocale}
                    onChange={(v) => setDateLocale(v ?? "")}
                    allowDeselect={false}
                    comboboxProps={{ withinPortal: true, radius: "md" }}
                  />
                </Field>
                <Field
                  label={t("settings.timezone")}
                  hint={
                    !timezone && BROWSER_TZ
                      ? t("settings.timezoneHintDetected", { value: BROWSER_TZ })
                      : t("settings.timezoneHint")
                  }
                >
                  <Select
                    data={TIMEZONES}
                    value={timezone}
                    onChange={(v) => setTimezone(v ?? "")}
                    allowDeselect={false}
                    searchable
                    comboboxProps={{ withinPortal: true, radius: "md" }}
                  />
                </Field>
                <Field label={t("settings.preview")} hint={t("settings.previewHint")} last>
                  <Code
                    block
                    style={{ fontSize: 13, padding: "10px 12px", background: "var(--surface-2)" }}
                  >
                    {preview}
                  </Code>
                </Field>
              </Section>

              {/* Interface language moved to the sidebar — it's a client-only,
                  app-wide switch, not a saved-profile field, so it belongs with
                  the other global controls rather than behind a Save button here. */}

              {/* Clears the sticky bar below, so it never covers the last field. */}
              {dirty && <Box h={64} aria-hidden />}
            </PageStack>
          </Tabs.Panel>

          <Tabs.Panel value="appearance">
            <AppearanceSection bare />
          </Tabs.Panel>


          <Tabs.Panel value="connections">
       
            <Box mb="lg">
              <Text fw={650} size="sm" style={{ letterSpacing: "-0.01em" }}>
                {t("settings.connectionsTitle", "Connected accounts")}
              </Text>
              <Text c="dimmed" size="xs" mt={2}>
                {t(
                  "settings.connectionsHint",
                  "Networks Quantalog can publish your scheduled posts to.",
                )}
              </Text>
            </Box>

            <div className="connection-grid">
              <ConnectionCard
                mark={<LinkedInMark size={26} />}
                tint={LINKEDIN_BLUE}
                name="LinkedIn"
                hint="Publishing account for scheduled social posts."
              >
                <LinkedInConnection />
              </ConnectionCard>

              {/* Instagram sits beside LinkedIn rather than after Facebook:
                  the two connectable networks belong together, and a live card
                  below a "soon" one reads as being unavailable too. */}
              <ConnectionCard
                mark={<InstagramMark size={26} />}
                tint={INSTAGRAM_PINK}
                name="Instagram"
                hint="Feed posts from the same composer."
              >
                <InstagramConnection />
              </ConnectionCard>

              <ConnectionCard
                mark={<FacebookMark size={26} />}
                tint={FACEBOOK_BLUE}
                name="Facebook"
                hint="Pages and profile posting."
                soon
              />
            </div>
          </Tabs.Panel>
        </Tabs>

        {/* Save follows you down a long form rather than sitting at the top out
            of sight. It only appears once there is something to save, so the
            page isn't carrying a permanent bar for a form nobody touched. */}
        {dirty && (
          <Box className="save-bar">
            <Group justify="space-between" gap="md" wrap="nowrap">
              <Group gap={8} wrap="nowrap" style={{ minWidth: 0 }}>
                <span className="save-bar__dot" aria-hidden />
                <Text size="sm" fw={500} truncate>{t("common.unsavedChanges")}</Text>
              </Group>
              <Group gap="sm" wrap="nowrap">
                <Button
                  variant="default"
                  size="sm"
                  leftSection={<Undo2 size={15} />}
                  onClick={seedFromUser}
                  disabled={saving}
                  title={`${t("common.discard")} (Esc)`}
                >
                  {t("common.discard")}
                  <Text component="span" size="xs" c="dimmed" ml={6} visibleFrom="sm">
                    Esc
                  </Text>
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  leftSection={<Save size={15} />}
                  loading={saving}
                >
                  {t("common.save")}
                </Button>
              </Group>
            </Group>
          </Box>
        )}
      </form>

      {/* Outside the form: a button inside one would submit the profile on click,
          and the modal is not part of what Save writes. */}
      <AvatarCropper
        file={cropFile}
        busy={avatarBusy}
        onCancel={() => setCropFile(null)}
        onConfirm={(cropped) => void saveCrop(cropped)}
      />
    </AppShell>
  );
}
