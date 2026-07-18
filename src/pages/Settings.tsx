import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import {
  Title, Text, Card, Stack, Group, TextInput, Button, Avatar, Badge,
  SimpleGrid, Select, Divider, Box,
} from "@mantine/core";
import { Check, Save } from "lucide-react";
import { AppShell } from "../components/AppShell";
import { useAuth } from "../auth";
import { notify, errMessage } from "../notify";
import { shortDate } from "../utils";

/**
 * A short list beats a full CLDR dump: these cover the accounts we have, and
 * the effect of the setting (day/month order, month names) is visible in the
 * preview below the field, so an unlisted locale is a request rather than a
 * guess.
 */
const LOCALES = [
  { value: "", label: "Use my browser's setting" },
  { value: "en-GB", label: "English (UK) — 18 Jul 2026" },
  { value: "en-US", label: "English (US) — Jul 18, 2026" },
  { value: "en-IN", label: "English (India) — 18 Jul 2026" },
  { value: "de-DE", label: "German — 18. Juli 2026" },
  { value: "fr-FR", label: "French — 18 juil. 2026" },
  { value: "es-ES", label: "Spanish — 18 jul 2026" },
  { value: "ja-JP", label: "Japanese — 2026年7月18日" },
];

/**
 * Timezones the dashboard is actually used from. The browser's own zone is
 * always offered first so the default needs no lookup.
 */
const TIMEZONES = [
  { value: "", label: "Use my browser's timezone" },
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
  if (!s) return null; // optional
  if (!/^\+?[\d\s\-()]{6,20}$/.test(s)) return "Enter a valid phone number";
  return null;
}

function avatarError(v: string): string | null {
  const s = v.trim();
  if (!s) return null; // optional
  if (!/^https?:\/\/\S+$/i.test(s)) return "Must be a link starting with http:// or https://";
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

  // Seed from the session once it is known, and re-seed if the session changes
  // underneath us (an admin entering or leaving an impersonation).
  useEffect(() => {
    if (!user) return;
    setFirstName(user.firstName ?? "");
    setLastName(user.lastName ?? "");
    setMobile(user.mobile ?? "");
    setAvatarUrl(user.avatarUrl ?? "");
    setDateLocale(user.dateLocale ?? "");
    setTimezone(user.timezone ?? "");
    setErrors({});
  }, [user?.id, user?.impersonating]);

  const dirty =
    !!user &&
    (firstName !== (user.firstName ?? "") ||
      lastName !== (user.lastName ?? "") ||
      mobile !== (user.mobile ?? "") ||
      avatarUrl !== (user.avatarUrl ?? "") ||
      dateLocale !== (user.dateLocale ?? "") ||
      timezone !== (user.timezone ?? ""));

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

  const initials = `${firstName} ${lastName}`.trim().slice(0, 2).toUpperCase() ||
    user.name.slice(0, 2).toUpperCase();

  return (
    <AppShell>
      <Box mb="lg">
        <Title order={1}>Settings</Title>
        <Text c="dimmed" size="sm" mt={6}>
          Your profile and how dates are shown across the dashboard.
        </Text>
      </Box>

      <form onSubmit={submit}>
        <Stack gap="lg" style={{ maxWidth: 720 }}>
          <Card withBorder radius="md" padding="lg">
            <Group gap="md" mb="lg" wrap="nowrap">
              <Avatar
                src={avatarError(avatarUrl) ? null : avatarUrl || null}
                color="emerald"
                radius="md"
                size={64}
              >
                {initials}
              </Avatar>
              <div style={{ minWidth: 0 }}>
                <Group gap="xs">
                  <Text fw={600} truncate>
                    {`${firstName} ${lastName}`.trim() || user.name}
                  </Text>
                  <Badge size="sm" variant="light" color={user.role === "admin" ? "grape" : "gray"}>
                    {user.role}
                  </Badge>
                </Group>
                <Text size="sm" c="dimmed" truncate>{user.email}</Text>
              </div>
            </Group>

            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
              <TextInput
                label="First name"
                value={firstName}
                onChange={(e) => setFirstName(e.currentTarget.value)}
                error={errors.firstName}
                required
              />
              <TextInput
                label="Last name"
                value={lastName}
                onChange={(e) => setLastName(e.currentTarget.value)}
              />
              <TextInput
                label="Email"
                value={user.email}
                disabled
                description="Your email is your sign-in and can't be changed here."
              />
              <TextInput
                label="Mobile number"
                placeholder="+91 98765 43210"
                value={mobile}
                onChange={(e) => setMobile(e.currentTarget.value)}
                error={errors.mobile}
              />
            </SimpleGrid>

            <Divider my="lg" />

            <TextInput
              label="Profile image URL"
              placeholder="https://example.com/me.jpg"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.currentTarget.value)}
              error={errors.avatarUrl}
              description="Paste a link to an image. Uploading one isn't supported yet."
            />
          </Card>

          <Card withBorder radius="md" padding="lg">
            <Text fw={600} mb={4}>Dates</Text>
            <Text size="sm" c="dimmed" mb="lg">
              Applies to every date shown in the dashboard.
            </Text>

            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
              <Select
                label="Date format"
                data={LOCALES}
                value={dateLocale}
                onChange={(v) => setDateLocale(v ?? "")}
                allowDeselect={false}
                comboboxProps={{ withinPortal: true, radius: "md" }}
              />
              <Select
                label="Timezone"
                data={TIMEZONES}
                value={timezone}
                onChange={(v) => setTimezone(v ?? "")}
                allowDeselect={false}
                searchable
                comboboxProps={{ withinPortal: true, radius: "md" }}
                description="Decides which day a stat falls on."
              />
            </SimpleGrid>

            {/* Saved settings are already live here, so the preview only tells
                the truth after a save — say so rather than faking it. */}
            <Text size="sm" c="dimmed" mt="md">
              Today currently reads as <b>{shortDate(new Date())}</b>.
            </Text>
          </Card>

          <Group justify="flex-end">
            <Button
              type="submit"
              leftSection={saving ? <Check size={15} /> : <Save size={15} />}
              loading={saving}
              disabled={!dirty}
            >
              Save changes
            </Button>
          </Group>
        </Stack>
      </form>
    </AppShell>
  );
}
