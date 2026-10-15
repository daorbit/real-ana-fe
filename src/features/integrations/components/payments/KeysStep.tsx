import { Anchor, Badge, Button, Group, PasswordInput, SegmentedControl, Stack, Text, TextInput } from "@mantine/core";
import { CircleCheck, ExternalLink, Link2 } from "lucide-react";
import { dateTime } from "@/shared/lib/format";
import { StudioSection } from "../studio/StudioParts";
import { Crumbs } from "./PaymentBits";
import type { ProviderCopy } from "./providerCopy";
import type { PaymentMode, ProviderSettings } from "../../types";
import classes from "./Payments.module.css";

interface Props {
  copy: ProviderCopy;
  view: ProviderSettings | undefined;
  tab: PaymentMode;
  keyId: string;
  keySecret: string;
  configurable: boolean;
  saving: boolean;
  testing: boolean;
  onTab: (mode: PaymentMode) => void;
  onKeyId: (value: string) => void;
  onKeySecret: (value: string) => void;
  onSave: () => void;
  onTest: () => void;
  onRemove: () => void;
}

export function KeysStep({
  copy,
  view,
  tab,
  keyId,
  keySecret,
  configurable,
  saving,
  testing,
  onTab,
  onKeyId,
  onKeySecret,
  onSave,
  onTest,
  onRemove,
}: Props) {
  const pair = view?.[tab];
  const inUse = (view?.mode ?? "test") === tab;

  return (
    <>
      <SegmentedControl
        fullWidth
        value={tab}
        onChange={(value) => onTab(value as PaymentMode)}
        data={[
          { value: "test", label: "Test keys" },
          { value: "live", label: "Live keys" },
        ]}
      />

      <StudioSection
        title={`${tab === "live" ? "Live" : "Test"} credentials`}
        description={
          <>
            <Crumbs steps={copy.keysPath} /> in the{" "}
            <Anchor href={copy.dashboardUrl} target="_blank" rel="noreferrer" size="xs" className={classes.inlineLink}>
              {copy.dashboardName}
              <ExternalLink size={11} />
            </Anchor>
          </>
        }
        action={
          inUse ? (
            <Badge size="sm" variant="light" color="teal">
              In use
            </Badge>
          ) : undefined
        }
      >
        <Stack gap="md">
          <TextInput
            label={copy.keyIdLabel}
            placeholder={pair?.hasKeyId ? "••••••••" : copy.keyIdPlaceholder(tab)}
            description={pair?.hasKeyId ? `Saved as ${pair.keyId}. Leave blank to keep it.` : copy.keyIdHint(tab)}
            value={keyId}
            autoComplete="off"
            onChange={(e) => onKeyId(e.currentTarget.value)}
          />

          <PasswordInput
            label={copy.secretLabel}
            description={
              pair?.keySecretMask
                ? `Saved as ${pair.keySecretMask}. Leave blank to keep it.`
                : "Stored encrypted. Never shown again once saved."
            }
            placeholder={pair?.keySecretMask ? "••••••••" : `Your ${copy.secretLabel.toLowerCase()}`}
            value={keySecret}
            autoComplete="new-password"
            onChange={(e) => onKeySecret(e.currentTarget.value)}
          />

          {pair?.verifiedAt && (
            <Group gap={6} wrap="nowrap">
              <CircleCheck size={15} className={classes.verified} />
              <Text size="xs" c="dimmed">
                Verified {dateTime(pair.verifiedAt)}
                {pair.businessName ? ` · ${pair.businessName}` : ""}
              </Text>
            </Group>
          )}

          <Group gap="sm">
            <Button type="button" onClick={onSave} loading={saving} disabled={!configurable}>
              Save keys
            </Button>
            <Button
              type="button"
              variant="default"
              leftSection={<Link2 size={16} />}
              onClick={onTest}
              loading={testing}
              disabled={!pair?.hasKeyId}
            >
              Test connection
            </Button>
            {pair?.hasKeyId && (
              <Button type="button" variant="subtle" color="red" onClick={onRemove} disabled={saving}>
                Remove
              </Button>
            )}
          </Group>
        </Stack>
      </StudioSection>
    </>
  );
}
