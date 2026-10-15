import { Group, SegmentedControl, Stack, Switch, Text } from "@mantine/core";
import { CircleCheck } from "lucide-react";
import { dateTime } from "@/shared/lib/format";
import { StudioSection } from "../studio/StudioParts";
import { Callout } from "./PaymentBits";
import type { ProviderCopy } from "./providerCopy";
import type { PaymentMode, ProviderSettings } from "../../types";
import classes from "./Payments.module.css";

interface Props {
  copy: ProviderCopy;
  view: ProviderSettings | undefined;
  saving: boolean;
  onMode: (mode: PaymentMode) => void;
  onEnabled: (enabled: boolean) => void;
}

export function GoLiveStep({ copy, view, saving, onMode, onEnabled }: Props) {
  const label = view?.label ?? "the gateway";
  const mode = view?.mode ?? "test";
  const liveReady = Boolean(
    view?.live.hasKeyId && view.live.verifiedAt && (copy.webhookSecretless || view.live.webhookSecretMask),
  );
  const open = (view?.checklist ?? []).filter((item) => !item.done);

  return (
    <>
      <StudioSection
        title="Mode"
        description={
          mode === "test"
            ? `No real money moves. Use ${label}'s test cards to try the whole flow end to end.`
            : "Every submission charges the respondent for real, using your live keys."
        }
      >
        <SegmentedControl
          fullWidth
          value={mode}
          disabled={saving}
          onChange={(value) => onMode(value as PaymentMode)}
          data={[
            { value: "test", label: "Test mode" },
            { value: "live", label: "Live mode" },
          ]}
        />
      </StudioSection>

      {mode === "live" && !liveReady && (
        <Callout tone="danger" title="Live mode is not ready">
          <Stack gap={4}>
            {!view?.live.hasKeyId && <span>No live keys are saved for {label}.</span>}
            {view?.live.hasKeyId && !view.live.verifiedAt && (
              <span>The live keys have never been verified. Press Test connection on the keys step.</span>
            )}
            {!copy.webhookSecretless && !view?.live.webhookSecretMask && (
              <span>No live webhook secret is saved. Payments will be taken but never confirmed.</span>
            )}
            <span>Switch back to test mode until this is fixed, or respondents will be charged without their response completing.</span>
          </Stack>
        </Callout>
      )}

      <StudioSection title="Accept payments" description={`Turn off to stop every form charging through ${label}.`}>
        <Switch
          label={`Accept ${label} payments`}
          checked={Boolean(view?.enabled)}
          disabled={saving}
          onChange={(e) => onEnabled(e.currentTarget.checked)}
        />
      </StudioSection>

      {copy.needsPhone && (
        <Callout tone="warn" title={`${label} needs a phone number`}>
          Forms without a phone field ask respondents for a mobile number above the pay button. That answer is not
          stored, so add a phone field to keep it in your responses.
        </Callout>
      )}

      {open.length > 0 && (
        <Callout tone="neutral" title="Still to do">
          <Stack gap={4}>
            {open.map((item) => (
              <span key={item.id}>
                <strong>{item.label}</strong>
                {item.hint ? `: ${item.hint}` : ""}
              </span>
            ))}
          </Stack>
        </Callout>
      )}

      {view?.lastChargeAt && (
        <Group gap={6} wrap="nowrap">
          <CircleCheck size={15} className={classes.verified} />
          <Text size="xs" c="dimmed">
            Last payment received {dateTime(view.lastChargeAt)}
          </Text>
        </Group>
      )}
    </>
  );
}
