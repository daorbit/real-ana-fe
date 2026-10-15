import { ActionIcon, Anchor, Button, Code, CopyButton, Group, PasswordInput, Stack, Text, Tooltip } from "@mantine/core";
import { Check, Copy, ExternalLink } from "lucide-react";
import { StudioSection } from "../studio/StudioParts";
import { Callout, Crumbs } from "./PaymentBits";
import type { ProviderCopy } from "./providerCopy";
import type { PaymentMode, ProviderSettings } from "../../types";
import classes from "./Payments.module.css";

interface Props {
  copy: ProviderCopy;
  view: ProviderSettings | undefined;
  tab: PaymentMode;
  url: string;
  webhookSecret: string;
  configurable: boolean;
  saving: boolean;
  onWebhookSecret: (value: string) => void;
  onSave: () => void;
}

export function WebhookStep({ copy, view, tab, url, webhookSecret, configurable, saving, onWebhookSecret, onSave }: Props) {
  const label = view?.label ?? "your gateway";
  const pair = view?.[tab];

  return (
    <>
      <StudioSection
        title="Webhook URL"
        description={
          <>
            Register it once in {label} under{" "}
            <Anchor href={copy.webhookConsoleUrl} target="_blank" rel="noreferrer" size="xs" className={classes.inlineLink}>
              <Crumbs steps={copy.webhookPath} />
              <ExternalLink size={11} />
            </Anchor>
          </>
        }
        action={
          <CopyButton value={url}>
            {({ copied, copy: doCopy }) => (
              <Tooltip label={copied ? "Copied" : "Copy URL"} withArrow>
                <ActionIcon variant="default" onClick={doCopy} aria-label="Copy webhook URL">
                  {copied ? <Check size={15} /> : <Copy size={15} />}
                </ActionIcon>
              </Tooltip>
            )}
          </CopyButton>
        }
      >
        <Stack gap="sm">
          <Code block className={classes.urlBlock}>
            {url}
          </Code>
          <Text size="xs" c="dimmed">
            Covers every paid form in this workspace. Only for {label}.
          </Text>
        </Stack>
      </StudioSection>

      <StudioSection title="Events to subscribe" description={`Tick these when you create the webhook in ${label}.`}>
        <Group gap={6}>
          {copy.webhookEvents.map((event) => (
            <Code key={event}>{event}</Code>
          ))}
        </Group>
      </StudioSection>

      {copy.webhookSecretless ? (
        <Callout tone="neutral" title="No webhook secret to paste">
          {label} signs with the {copy.secretLabel} from the keys step, so registering the URL finishes this step.
        </Callout>
      ) : (
        <StudioSection title="Webhook secret" description={`The secret you set when creating the webhook in ${label}.`}>
          <Stack gap="md">
            <PasswordInput
              label="Secret"
              description={pair?.webhookSecretMask ? `Saved as ${pair.webhookSecretMask}. Leave blank to keep it.` : undefined}
              placeholder={pair?.webhookSecretMask ? "••••••••" : "Your webhook secret"}
              value={webhookSecret}
              autoComplete="new-password"
              onChange={(e) => onWebhookSecret(e.currentTarget.value)}
            />
            <Group>
              <Button type="button" onClick={onSave} loading={saving} disabled={!configurable}>
                Save webhook secret
              </Button>
            </Group>
          </Stack>
        </StudioSection>
      )}
    </>
  );
}
