import {
  Stack, TextInput, Textarea, Select, Switch, Text, Group, Badge, ActionIcon,
  Divider, Alert, ColorInput,
} from "@mantine/core";
import { Plus, X, Info } from "lucide-react";
import { useState } from "react";
import type { FormField, FormSettings } from "@/features/forms/lib/types";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * Everything about the form that is not a field.
 *
 * Grouped by the question being answered — what happens after someone submits,
 * who hears about it, how repeats are treated, how it looks — rather than by
 * which server field each control writes to.
 */
export function SettingsPanel({
  settings,
  fields,
  canRemoveBranding,
  onChange,
}: {
  settings: FormSettings;
  fields: FormField[];
  /** False on Free: the hosted page carries the Quantalog line and says so here. */
  canRemoveBranding: boolean;
  onChange: (next: Partial<FormSettings>) => void;
}) {
  const [emailInput, setEmailInput] = useState("");
  const [emailError, setEmailError] = useState("");

  const addEmail = () => {
    const email = emailInput.trim().toLowerCase();
    if (!email) return;
    if (!EMAIL_RE.test(email)) {
      setEmailError(`"${email}" does not look like an email address`);
      return;
    }
    if (settings.notifyEmails.includes(email)) {
      setEmailInput("");
      return;
    }
    onChange({ notifyEmails: [...settings.notifyEmails, email] });
    setEmailInput("");
    setEmailError("");
  };

  return (
    <Stack gap="lg" maw={620}>
      <Stack gap="md">
        <Text fw={650} size="sm">After someone submits</Text>

        <TextInput
          label="Submit button text"
          value={settings.submitText}
          onChange={(e) => onChange({ submitText: e.currentTarget.value })}
        />

        <Textarea
          label="Thank-you message"
          description="Shown in place of the form once it has been sent."
          value={settings.successMessage}
          onChange={(e) => onChange({ successMessage: e.currentTarget.value })}
          autosize
          minRows={2}
        />

        <TextInput
          label="Redirect URL"
          description="Optional. Set this and the visitor goes here instead of seeing the message above."
          placeholder="https://example.com/thanks"
          value={settings.redirectUrl}
          onChange={(e) => onChange({ redirectUrl: e.currentTarget.value })}
        />
      </Stack>

      <Divider />

      <Stack gap="md">
        <Text fw={650} size="sm">Notifications</Text>

        <TextInput
          label="Email these addresses on every submission"
          placeholder="you@example.com"
          value={emailInput}
          error={emailError || undefined}
          onChange={(e) => { setEmailInput(e.currentTarget.value); setEmailError(""); }}
          onKeyDown={(e) => {
            if (e.key === "Enter") { e.preventDefault(); addEmail(); }
          }}
          rightSection={
            <ActionIcon variant="subtle" onClick={addEmail} disabled={!emailInput.trim()}>
              <Plus size={15} />
            </ActionIcon>
          }
        />

        {settings.notifyEmails.length > 0 && (
          <Group gap={6}>
            {settings.notifyEmails.map((email) => (
              <Badge
                key={email}
                variant="light"
                rightSection={
                  <ActionIcon
                    size="xs"
                    variant="transparent"
                    onClick={() => onChange({ notifyEmails: settings.notifyEmails.filter((e) => e !== email) })}
                  >
                    <X size={11} />
                  </ActionIcon>
                }
              >
                {email}
              </Badge>
            ))}
          </Group>
        )}

        <Alert variant="light" color="gray" icon={<Info size={15} />} p="xs">
          <Text size="xs">
            A busy form switches to a single hourly summary instead of one email per response —
            a hundred submissions never means a hundred emails.
          </Text>
        </Alert>
      </Stack>

      <Divider />

      <Stack gap="md">
        <Text fw={650} size="sm">Duplicate responses</Text>

        <Select
          label="Identify people by"
          description="Usually the email field. Leave unset to treat every response as a new one."
          placeholder="Nothing — keep every response"
          clearable
          value={settings.dedupFieldKey || null}
          onChange={(v) => onChange({ dedupFieldKey: v ?? "" })}
          data={fields
            .filter((f) => !f.hidden && f.type !== "checkbox")
            .map((f) => ({ value: f.key, label: f.label }))}
        />

        {settings.dedupFieldKey && (
          <Select
            label="When the same person answers again"
            value={settings.dedupAction}
            onChange={(v) => onChange({ dedupAction: (v as FormSettings["dedupAction"]) ?? "allow" })}
            data={[
              { value: "allow", label: "Keep both responses" },
              { value: "replace", label: "Replace their previous answers" },
              { value: "reject", label: "Turn the second one away" },
            ]}
          />
        )}
      </Stack>

      <Divider />

      <Stack gap="md">
        <Text fw={650} size="sm">Appearance</Text>

        <TextInput
          label="Logo URL"
          placeholder="https://example.com/logo.png"
          value={settings.logoUrl}
          onChange={(e) => onChange({ logoUrl: e.currentTarget.value })}
        />

        <ColorInput
          label="Accent colour"
          format="hex"
          value={settings.primaryColor}
          onChange={(v) => onChange({ primaryColor: v })}
        />

        {!canRemoveBranding && (
          <Alert variant="light" color="gray" p="xs">
            <Text size="xs">
              Your hosted form carries a small “Powered by Quantalog” line. Upgrade to remove it.
            </Text>
          </Alert>
        )}
      </Stack>

      <Divider />

      <Stack gap="md">
        <Text fw={650} size="sm">Spam and closing</Text>

        <Switch
          label="Require a captcha"
          description="Off by default. A captcha costs you conversions, so turn it on when you actually see spam — the honeypot and rate limits handle the ordinary case."
          checked={settings.captchaEnabled}
          onChange={(e) => onChange({ captchaEnabled: e.currentTarget.checked })}
        />

        <Textarea
          label="Message when the form is closed"
          description="Shown to anyone opening the link after you stop accepting responses."
          value={settings.closedMessage}
          onChange={(e) => onChange({ closedMessage: e.currentTarget.value })}
          autosize
          minRows={2}
        />
      </Stack>
    </Stack>
  );
}
