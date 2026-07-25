import { useCallback, useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import {
  Text, Group, TextInput, Button, Avatar, Badge, Select, Box, Code,
} from "@mantine/core";
import { Save, Trash2, Undo2, Upload } from "lucide-react";
import { useTranslation } from "react-i18next";
import { AppShell } from "../components/AppShell";
import { PageHeader, PageStack, Section, Field } from "../components/Page";
import { useAuth } from "../auth";
import { useUnsavedGuard } from "../hooks";
import { notify, errMessage } from "../notify";

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

function avatarError(v: string): string | null {
  const s = v.trim();
  if (!s) return null;
  if (!/^https?:\/\/\S+$/i.test(s)) return "settings.avatarBadUrl";
  return null;
}

export default function Settings() {
  const { t } = useTranslation();
  const { user, updateProfile, uploadAvatar, removeAvatar } = useAuth();
  const fileInput = useRef<HTMLInputElement | null>(null);
  const [avatarBusy, setAvatarBusy] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [mobile, setMobile] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [dateLocale, setDateLocale] = useState("");
  const [timezone, setTimezone] = useState("");
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [saving, setSaving] = useState(false);
  const [avatarBroken, setAvatarBroken] = useState(false);

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
    setAvatarUrl(user.avatarUrl ?? "");
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
      avatarUrl !== (user.avatarUrl ?? "") ||
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
      avatarUrl: avatarError(avatarUrl),
    };
    setErrors(next);
    if (Object.values(next).some(Boolean)) return;

    setSaving(true);
    try {
      await updateProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        mobile: mobile.trim(),
        avatarUrl: avatarUrl.trim(),
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
   * Pick a file and upload it right away.
   *
   * Deliberately outside the form's save cycle: the picture is stored the moment
   * it is chosen, so the avatar beside it updates immediately and there is no
   * uploaded file left unreferenced if the user leaves without saving. The URL
   * field is re-seeded from the new user, keeping the form undirty.
   */
  const pickAvatar = async (file: File | null) => {
    if (!file) return;
    setAvatarBusy(true);
    setErrors((prev) => ({ ...prev, avatarUrl: null }));
    try {
      await uploadAvatar(file);
      setAvatarBroken(false);
      notify.success(t("settings.avatarUploaded"), t("common.saved"));
    } catch (err) {
      notify.error(errMessage(err, t("settings.avatarUploadError")));
    } finally {
      setAvatarBusy(false);
      // Clear the input, so choosing the same file again still fires a change.
      if (fileInput.current) fileInput.current.value = "";
    }
  };

  const clearAvatar = async () => {
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

        <PageStack>
          {/* Identity card — the avatar and name read as a profile rather than
              as two more text inputs. */}
          <Box className="surface-card" p="lg">
            <Group gap="lg" wrap="nowrap">
              <Avatar
                src={avatarError(avatarUrl) || avatarBroken ? null : avatarUrl || null}
                color="emerald"
                radius="md"
                size={72}
                imageProps={{ onError: () => setAvatarBroken(true) }}
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
                    color={user.role === "admin" ? "grape" : "gray"}
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
                  onChange={(e) => void pickAvatar(e.currentTarget.files?.[0] ?? null)}
                />
                <Group gap="xs" mt="sm">
                  <Button
                    size="xs"
                    variant="light"
                    leftSection={<Upload size={14} />}
                    loading={avatarBusy}
                    onClick={() => fileInput.current?.click()}
                  >
                    {t("settings.avatarUpload")}
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
            <Field label={t("settings.mobile")} hint={t("common.optional")}>
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
            <Field
              label={t("settings.profileImage")}
              hint={t("settings.profileImageHint")}
              last
            >
              <TextInput
                placeholder="https://example.com/me.jpg"
                value={avatarUrl}
                onChange={(e) => {
                  const v = e.currentTarget.value;
                  setAvatarUrl(v);
                  setAvatarBroken(false);
                  clearIfValid("avatarUrl", avatarError, v);
                }}
                error={
                  errText(errors.avatarUrl) ??
                  (avatarBroken ? t("settings.avatarBroken") : undefined)
                }
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
              app-wide switch, not a saved-profile field, so it belongs with the
              other global controls rather than behind a Save button here. */}

          {/* Clears the sticky bar below, so it never covers the last field. */}
          {dirty && <Box h={64} aria-hidden />}
        </PageStack>

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
    </AppShell>
  );
}
