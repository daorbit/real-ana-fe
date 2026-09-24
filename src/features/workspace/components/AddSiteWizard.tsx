import { Box, Modal, ScrollArea } from "@mantine/core";
import { useAddSiteForm } from "./addSite/useAddSiteForm";
import { WizardHeader } from "./addSite/WizardHeader";
import { WizardFooter } from "./addSite/WizardFooter";
import { StepHeading } from "./addSite/StepHeading";
import { PlatformStep } from "./addSite/PlatformStep";
import { WebDetailsStep } from "./addSite/WebDetailsStep";
import { AppDetailsStep } from "./addSite/AppDetailsStep";
import { TrackingStep } from "./addSite/TrackingStep";
import { AppInstallStep, WebInstallStep } from "./addSite/InstallStep";
import classes from "./addSite/AddSiteWizard.module.css";

interface Props {
  opened: boolean;
  onClose: () => void;
  workspaceId: string;
  existingDomains: string[];
}

export function AddSiteWizard({ opened, onClose, workspaceId, existingDomains }: Props) {
  const form = useAddSiteForm(workspaceId, existingDomains);
  const { step, steps, lastStep, platform, created } = form;
  const isApp = platform === "app";
  const isLast = step === lastStep;

  const close = () => {
    onClose();
    setTimeout(form.reset, 200);
  };

  const primaryLabel = step === lastStep - 1 ? (isApp ? "Create app" : "Create site") : "Continue";

  return (
    <Modal
      opened={opened}
      onClose={close}
      fullScreen
      withCloseButton={false}
      padding={0}
      transitionProps={{ transition: "fade", duration: 150 }}
      closeOnClickOutside={!isLast}
      classNames={{ content: classes.content, body: classes.modalBody }}
    >
      <WizardHeader title={isApp ? "Add an app" : "Add a site"} steps={steps} current={step} onClose={close} />

      <ScrollArea className={classes.scroll} type="auto">
        <Box className={classes.body} data-wide={isLast || undefined}>
          <StepHeading step={steps[step]} index={step} total={steps.length} />

          {step === 0 && <PlatformStep value={platform} onChange={form.setPlatform} />}
          {step === 1 && !isApp && <WebDetailsStep form={form} />}
          {step === 1 && isApp && <AppDetailsStep form={form} />}
          {step === 2 && !isApp && <TrackingStep form={form} />}
          {isLast && created && !isApp && <WebInstallStep form={form} site={created} workspaceId={workspaceId} />}
          {isLast && created && isApp && <AppInstallStep form={form} site={created} />}
        </Box>
      </ScrollArea>

      <WizardFooter
        canGoBack={step > 0 && !isLast}
        isLast={isLast}
        primaryLabel={primaryLabel}
        busy={form.creating}
        onBack={form.back}
        onNext={() => void form.next()}
        onDone={close}
      />
    </Modal>
  );
}
