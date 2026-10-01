import { useEffect, useState } from "react";
import { ActionIcon, CloseButton, Modal } from "@mantine/core";
import { ArrowLeft } from "lucide-react";
import { useSites } from "@/features/workspace";
import { EmbedWidgetPicker } from "@/features/dashboards/components/embeds/EmbedWidgetPicker";
import { EmbedSettings } from "@/features/dashboards/components/embeds/EmbedSettings";
import { EmbedPreview } from "@/features/dashboards/components/embeds/EmbedPreview";
import { EmbedCode } from "@/features/dashboards/components/embeds/EmbedCode";
import { useEmbedEditor } from "@/features/dashboards/hooks/useEmbedEditor";
import type { WidgetId } from "@/features/analytics/widgetCatalog";
import type { DashboardRange } from "@/features/dashboards/types";
import classes from "@/features/dashboards/components/embeds/Embeds.module.css";

type Step = "pick" | "configure";

export function EmbedModal({
  opened,
  workspaceId,
  embedId,
  initialWidget,
  initialRange,
  onClose,
}: {
  opened: boolean;
  workspaceId: string;
  embedId: string | null;
  initialWidget: WidgetId | null;
  initialRange?: DashboardRange;
  onClose: () => void;
}) {
  const { sites } = useSites(workspaceId);
  const { embed, draft, setDraft, setWidget, change, submit, creating } = useEmbedEditor({
    workspaceId, opened, embedId, initialWidget, initialRange,
  });
  const pickFirst = embedId === null && initialWidget === null;
  const [step, setStep] = useState<Step>(pickFirst ? "pick" : "configure");

  useEffect(() => {
    if (opened) setStep(pickFirst ? "pick" : "configure");
  }, [opened, pickFirst]);

  const picking = step === "pick" && !embed;
  const version = `${draft.range}:${draft.theme}:${draft.sites.join(",")}:${embed?.enabled}`;

  const title = picking ? "Choose a widget" : embed ? embed.name : "Set up your embed";
  const subtitle = picking
    ? "Pick the chart or number you want to show on another page."
    : embed
      ? "Changes save on their own and show up everywhere it's embedded."
      : "Name it, pick a period and theme, then create it to get the code.";

  const commitName = () => {
    const name = draft.name.trim();
    if (embed && name && name !== embed.name) void change({ name });
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size={picking ? 880 : 1040}
      radius="lg"
      padding={0}
      centered
      withCloseButton={false}
      overlayProps={{ blur: 4, backgroundOpacity: 0.55 }}
    >
      <div className={classes.modalHead}>
        {!picking && !embed && (
          <ActionIcon variant="subtle" color="gray" onClick={() => setStep("pick")} aria-label="Back to widgets">
            <ArrowLeft size={17} />
          </ActionIcon>
        )}
        <div className={classes.modalTitles}>
          <h2 className={classes.modalTitle}>{title}</h2>
          <p className={classes.modalSub}>{subtitle}</p>
        </div>
        {!embed && (
          <span className={classes.steps}>
            <span className={classes.stepDot} data-active />
            <span className={classes.stepDot} data-active={!picking || undefined} />
            Step {picking ? 1 : 2} of 2
          </span>
        )}
        <CloseButton onClick={onClose} aria-label="Close" />
      </div>

      {picking ? (
        <EmbedWidgetPicker
          onPick={(id) => {
            setWidget(id);
            setStep("configure");
          }}
        />
      ) : (
        <div className={classes.configure}>
          <EmbedSettings
            embed={embed}
            draft={draft}
            sites={sites}
            creating={creating}
            onName={(name) => setDraft((d) => ({ ...d, name }))}
            onCommitName={commitName}
            onChange={(patch) => void change(patch)}
            onChangeWidget={() => setStep("pick")}
            onSubmit={() => void submit()}
          />
          <div className={classes.output}>
            <div className={classes.outputLabel}>Live preview</div>
            <EmbedPreview token={embed?.token ?? null} widget={draft.widget} version={version} />
            {embed && (
              <>
                <div className={classes.outputLabel}>Embed code</div>
                <EmbedCode token={embed.token} widget={embed.widget} name={embed.name} />
              </>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
}
