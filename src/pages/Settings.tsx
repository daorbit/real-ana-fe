import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";
import {
  Text, Group, TextInput, Button, Avatar, Badge, Select, Box, Code,
} from "@mantine/core";
import { Save, Languages, Undo2 } from "lucide-react";
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

/** A phone number people actually type: digits, spaces, +, -, (), 6–20 long. */
function mobileError(v: string): string | null {
  const s = v.trim();
  if (!s) return null;
  if (!/^\+?[\d\s\-()]{6,20}$/.test(s)) return "Enter a valid phone number";
  return null;
}

function avatarError(v: string): string | null {
  const s = v.trim();
  if (!s) return null;
  if (!/^https?:\/\/\S+$/i.test(s)) return "Must start with http:// or https://";
  return null;
}

export default function Settings() {
  const { user, updateProfile } = useAuth();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [mobile, setMobile] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [dateLocale, setDateLocale] = useState("");
  const [timezone, setTimezone] = useState("");
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [saving, setSaving] = useState(false);

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
  useUnsavedGuard(dirty, "Your profile changes haven't been saved.");

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
      firstName: firstName.trim() ? null : "First name is required",
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
      notify.success("Your profile has been updated.", "Saved");
    } catch (err) {
      notify.error(errMessage(err, "Could not save your profile."));
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  const initials =
    `${firstName} ${lastName}`.trim().slice(0, 2).toUpperCase() ||
    user.name.slice(0, 2).toUpperCase();

  return (
    <AppShell>
      <form onSubmit={submit}>
        <PageHeader
          title="Settings"
          description="Your profile and how dates are shown across the dashboard."
          actions={
            <Button
              type="submit"
              leftSection={<Save size={15} />}
              loading={saving}
              disabled={!dirty}
            >
              Save changes
            </Button>
          }
        />

        <PageStack>
          {/* Identity card — the avatar and name read as a profile rather than
              as two more text inputs. */}
          <Box className="surface-card" p="lg">
            <Group gap="lg" wrap="nowrap">
              <Avatar
                src={avatarError(avatarUrl) ? null : avatarUrl || null}
                color="emerald"
                radius="md"
                size={72}
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
              </Box>
            </Group>
          </Box>

          <Section
            title="Profile"
            description="How you appear across Quantalog."
          >
            <Field label="First name" hint="Required.">
              <TextInput
                value={firstName}
                onChange={(e) => setFirstName(e.currentTarget.value)}
                error={errors.firstName}
              />
            </Field>
            <Field label="Last name">
              <TextInput
                value={lastName}
                onChange={(e) => setLastName(e.currentTarget.value)}
              />
            </Field>
            <Field
              label="Email"
              hint="Your email is your sign-in and can't be changed here."
            >
              <TextInput value={user.email} disabled />
            </Field>
            <Field label="Mobile number" hint="Optional.">
              <TextInput
                placeholder="+91 98765 43210"
                value={mobile}
                onChange={(e) => setMobile(e.currentTarget.value)}
                error={errors.mobile}
              />
            </Field>
            <Field
              label="Profile image"
              hint="Paste a link to an image. Uploading isn't supported yet."
              last
            >
              <TextInput
                placeholder="https://example.com/me.jpg"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.currentTarget.value)}
                error={errors.avatarUrl}
              />
            </Field>
          </Section>

          <Section
            title="Dates and time"
            description="Applies to every date shown in the dashboard."
          >
            <Field
              label="Date format"
              hint="Controls how dates are written — day and month order, and month names."
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
              label="Timezone"
              hint="Decides which day a stat falls on, and the clock time on every chart."
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
            <Field label="Preview" hint="Right now, with the settings above." last>
              <Code
                block
                style={{ fontSize: 13, padding: "10px 12px", background: "var(--surface-2)" }}
              >
                {preview}
              </Code>
            </Field>
          </Section>

          {/* Named rather than hidden: the absence of a language switcher is a
              real gap, and saying so beats letting people hunt for it. */}
          <Section
            title="Language"
            description="The dashboard interface language."
          >
            <Field
              label="Interface language"
              hint="Quantalog's interface is currently English only. Translations are planned — the date settings above already follow your region."
              last
            >
              <Group gap="xs" wrap="nowrap">
                <Languages size={16} style={{ color: "var(--muted)", flexShrink: 0 }} />
                <Text size="sm" c="dimmed">English</Text>
                <Badge size="xs" variant="light" color="gray" ml="auto">
                  More coming
                </Badge>
              </Group>
            </Field>
          </Section>

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
                <Text size="sm" fw={500} truncate>Unsaved changes</Text>
              </Group>
              <Group gap="sm" wrap="nowrap">
                <Button
                  variant="default"
                  size="sm"
                  leftSection={<Undo2 size={15} />}
                  onClick={seedFromUser}
                  disabled={saving}
                >
                  Discard
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  leftSection={<Save size={15} />}
                  loading={saving}
                >
                  Save changes
                </Button>
              </Group>
            </Group>
          </Box>
        )}
      </form>
    </AppShell>
  );
}
