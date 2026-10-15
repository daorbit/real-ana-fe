import { useState } from "react";
import { Badge, Button, Code, Group, Text, Title } from "@mantine/core";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useGetFormsPaymentsQuery } from "@/app/store";
import { usePaymentSetup } from "../../hooks/usePaymentSetup";
import { paymentWebhookUrl } from "../../lib/links";
import { IntegrationStudio } from "../studio/IntegrationStudio";
import { GatewayWordmark } from "../logos/GatewayWordmarks";
import { Callout } from "./PaymentBits";
import { StepRail } from "./StepRail";
import { KeysStep } from "./KeysStep";
import { WebhookStep } from "./WebhookStep";
import { GoLiveStep } from "./GoLiveStep";
import { PROVIDER_COPY, STEPS, firstOpenStep, type StepId } from "./providerCopy";
import type { PaymentProvider, PaymentSettings } from "../../types";
import classes from "./Payments.module.css";

interface Props {
  workspaceId: string;
  provider: PaymentProvider | null;
  onClose: () => void;
}

export function PaymentsModal({ workspaceId, provider, onClose }: Props) {
  const { currentData: settings } = useGetFormsPaymentsQuery(workspaceId);
  if (!provider || !settings) return null;
  return (
    <PaymentSetup key={provider} workspaceId={workspaceId} provider={provider} settings={settings} onClose={onClose} />
  );
}

function PaymentSetup({
  workspaceId,
  provider,
  settings,
  onClose,
}: {
  workspaceId: string;
  provider: PaymentProvider;
  settings: PaymentSettings;
  onClose: () => void;
}) {
  const view = settings.providers?.[provider];
  const copy = PROVIDER_COPY[provider];
  const setup = usePaymentSetup(workspaceId, provider, view);
  const [step, setStep] = useState<StepId>(() => firstOpenStep(view?.checklist));

  const done = (id: string) => Boolean(view?.checklist.find((item) => item.id === id)?.done);
  const stepDone: Record<StepId, boolean> = {
    keys: done("keys") && done("verified"),
    webhook: done("webhook"),
    golive: done("enabled"),
  };
  const live = (view?.mode ?? "test") === "live";
  const index = STEPS.findIndex((s) => s.id === step);
  const current = STEPS[index];
  const previous = STEPS[index - 1];
  const next = STEPS[index + 1];
  const label = view?.label ?? provider;

  const footer = (
    <Group justify="space-between" wrap="nowrap">
      {previous ? (
        <Button type="button" variant="default" leftSection={<ArrowLeft size={15} />} onClick={() => setStep(previous.id)}>
          {previous.label}
        </Button>
      ) : (
        <Text size="xs" c="dimmed">
          Step {index + 1} of {STEPS.length}
        </Text>
      )}
      {next ? (
        <Button type="button" rightSection={<ArrowRight size={15} />} onClick={() => setStep(next.id)}>
          Next: {next.label}
        </Button>
      ) : (
        <Button type="button" onClick={onClose}>
          Done
        </Button>
      )}
    </Group>
  );

  return (
    <IntegrationStudio
      opened
      onClose={onClose}
      brand={provider}
      title={label}
      subtitle="Take payments on your forms"
      badge={
        <Badge size="sm" variant="light" color={view?.enabled ? (live ? "teal" : "gray") : "gray"}>
          {view?.enabled ? (live ? "Live" : "Test mode") : "Off"}
        </Badge>
      }
      aside={
        <StepRail
          view={view}
          step={step}
          stepDone={stepDone}
          isDefault={settings.defaultProvider === provider}
          saving={setup.saving}
          onStep={setStep}
          onMakeDefault={() => void setup.update({ defaultProvider: provider }, `${label} is now the default.`)}
        />
      }
      footer={footer}
    >
      <div>
        <div className={classes.wordmark}>
          <GatewayWordmark provider={provider} height={22} />
        </div>
        <div className={classes.stepHead}>
          <div>
            <Title order={3}>{current.label}</Title>
            <Text size="sm" c="dimmed" mt={2}>
              {current.hint}
            </Text>
          </div>
        </div>
      </div>

      {!settings.configurable && (
        <Callout tone="warn" title="Payments cannot be saved yet">
          The forms service has no encryption key configured. Set <Code>ENCRYPTION_KEY</Code> on the server and restart
          it.
        </Callout>
      )}

      {step === "keys" && (
        <KeysStep
          copy={copy}
          view={view}
          tab={setup.tab}
          keyId={setup.keyId}
          keySecret={setup.keySecret}
          configurable={settings.configurable}
          saving={setup.saving}
          testing={setup.testing}
          onTab={setup.switchTab}
          onKeyId={setup.setKeyId}
          onKeySecret={setup.setKeySecret}
          onSave={() => void setup.saveKeys()}
          onTest={() => void setup.test()}
          onRemove={() => void setup.remove()}
        />
      )}

      {step === "webhook" && (
        <WebhookStep
          copy={copy}
          view={view}
          tab={setup.tab}
          url={paymentWebhookUrl(workspaceId, provider)}
          webhookSecret={setup.webhookSecret}
          configurable={settings.configurable}
          saving={setup.saving}
          onWebhookSecret={setup.setWebhookSecret}
          onSave={() => void setup.saveKeys()}
        />
      )}

      {step === "golive" && (
        <GoLiveStep
          copy={copy}
          view={view}
          saving={setup.saving}
          onMode={(mode) => void setup.update({ mode }, `Switched to ${mode} mode.`)}
          onEnabled={(enabled) =>
            void setup.update({ enabled }, enabled ? `${label} payments turned on.` : `${label} payments turned off.`)
          }
        />
      )}
    </IntegrationStudio>
  );
}
