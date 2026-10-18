import { Button } from "@mantine/core";
import { Plus } from "lucide-react";
import { PopupSchematic } from "@/features/popups/components/PopupSchematic";
import classes from "@/features/popups/components/Popups.module.css";

const STEPS = [
  { title: "Pick a form", text: "Any published form from Lead capture, with its own design." },
  { title: "Choose the moment", text: "After a few seconds, halfway down the page, or as someone is about to leave." },
  { title: "Go live", text: "It appears through the Quantalog script already on your site. No new code." },
];

export function PopupsEmpty({
  canEdit,
  hasSites,
  onCreate,
}: {
  canEdit: boolean;
  hasSites: boolean;
  onCreate: () => void;
}) {
  return (
    <section className={classes.empty}>
      <div>
        <div className={classes.emptyEyebrow}>Quantalog Popups</div>
        <h2 className={classes.emptyTitle}>Turn visitors into leads.</h2>
        <p className={classes.emptyText}>
          Show your lead capture forms as a popup or a corner slide-in, at the moment a visitor is most likely to say yes.
        </p>
        <ol className={classes.steps}>
          {STEPS.map((step, i) => (
            <li key={step.title} className={classes.step}>
              <span className={classes.stepNumber}>{i + 1}</span>
              <div>
                <div className={classes.stepTitle}>{step.title}</div>
                <div className={classes.stepText}>{step.text}</div>
              </div>
            </li>
          ))}
        </ol>
        {canEdit && (
          <Button size="md" radius="xl" leftSection={<Plus size={16} />} disabled={!hasSites} onClick={onCreate}>
            Create your first popup
          </Button>
        )}
        {!hasSites && <div className={classes.emptyNote}>Add a site first, then come back to create a popup.</div>}
      </div>
      <PopupSchematic layout="modal" size="lg" />
    </section>
  );
}
