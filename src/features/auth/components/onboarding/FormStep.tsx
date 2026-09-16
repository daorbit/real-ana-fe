import { useState } from "react";
import { ActionIcon, Button, Group, Loader, Textarea } from "@mantine/core";
import { ArrowLeft, ArrowRight, ArrowUp, RefreshCw } from "lucide-react";
import { FormPreview } from "./FormPreview";
import type { GeneratedForm } from "./formsApi";
import s from "./FormStep.module.css";

/**
 * Prompts that fit whatever the site said it was for, so the first click is
 * never into an empty box. Keyed by the `purpose` captured on the site step;
 * anything unrecognised falls back to `DEFAULT_IDEAS`.
 */
type Idea = {
  /** The chip's text — a few words, so a row of them stays readable. */
  label: string;
  /** What actually goes in the box. */
  prompt: string;
};

const IDEAS_BY_PURPOSE: Record<string, Idea[]> = {
  "E-commerce store": [
    { label: "Order enquiry", prompt: "An order enquiry form with product, quantity and delivery address" },
    { label: "Returns request", prompt: "A returns request with order number, reason and preferred resolution" },
    { label: "Stock alert", prompt: "A back-in-stock alert signup with email and the product wanted" },
  ],
  "SaaS product": [
    { label: "Demo request", prompt: "A demo request with name, work email, company size and use case" },
    { label: "Bug report", prompt: "A bug report with severity, steps to reproduce and a screenshot upload" },
    { label: "Feature request", prompt: "A feature request with a description, how urgent it is and who it helps" },
  ],
  Blog: [
    { label: "Newsletter signup", prompt: "A newsletter signup with name, email and topics of interest" },
    { label: "Guest post pitch", prompt: "A guest post pitch with title, outline and a link to past writing" },
  ],
  Documentation: [
    { label: "Docs feedback", prompt: "A docs feedback form with the page URL, what was unclear and an email" },
  ],
  Portfolio: [
    { label: "Project enquiry", prompt: "A project enquiry with budget range, timeline and a description" },
  ],
};

const DEFAULT_IDEAS: Idea[] = [
  { label: "Contact form", prompt: "A contact form with name, email, subject and a message" },
  { label: "Demo request", prompt: "A demo request with work email, company size and a preferred time" },
  { label: "Support ticket", prompt: "A support ticket with category, urgency and a file upload" },
];

/**
 * The step that offers to build a first form.
 *
 * Skippable, and deliberately so: a model call can take the better part of a
 * minute, and nothing in first-run setup should be able to stand between
 * someone and their dashboard. A failure here is a notice, never a dead end.
 */
export function FormStepBody({
  purpose,
  prompt,
  onPromptChange,
  form,
  generating,
  saving,
  error,
  onGenerate,
  onBack,
  onSkip,
  onKeep,
  onDiscard,
}: {
  purpose: string;
  prompt: string;
  onPromptChange: (v: string) => void;
  form: GeneratedForm | null;
  generating: boolean;
  saving: boolean;
  error: string | null;
  onGenerate: () => void;
  onBack: () => void;
  onSkip: () => void;
  onKeep: () => void;
  /** Drop the draft and go back to the prompt box. */
  onDiscard: () => void;
}) {
  const [ideas] = useState(() => IDEAS_BY_PURPOSE[purpose] ?? DEFAULT_IDEAS);

  // Once there's a form, the ask moves aside and the preview takes the room —
  // the question has been answered and the only one left is "keep it?".
  if (form) {
    return (
      <div className={s.result}>
        {/* Everything to decide with, above the thing being decided about: what
            came back, and the three ways out of this step. A bar pinned under
            the preview left the buttons floating a long way from it. */}
        <div className={s.resultBar}>
          <div className={s.resultSummary}>
            <strong className={s.resultTitle}>{form.title}</strong>
            <span className={s.resultCount}>
              {form.fields.length} field{form.fields.length === 1 ? "" : "s"}
              {" · edit anything later in the builder"}
            </span>
          </div>

          <Group gap="xs" wrap="nowrap">
            <Button
              variant="subtle"
              color="gray"
              size="sm"
              onClick={onDiscard}
              disabled={saving}
              leftSection={<RefreshCw size={14} />}
            >
              Try again
            </Button>
            <Button
              variant="subtle"
              color="gray"
              size="sm"
              onClick={onSkip}
              disabled={saving}
            >
              Skip this
            </Button>
            <Button
              className="auth-btn"
              size="sm"
              loading={saving}
              onClick={onKeep}
              rightSection={<ArrowRight size={15} />}
            >
              Keep this form
            </Button>
          </Group>
        </div>

        {error && <p className={s.error}>{error}</p>}

        <div className={s.resultPreview}>
          <FormPreview form={form} />
        </div>
      </div>
    );
  }

  return (
    <div className={s.ask}>
      <div className={s.composerWrap}>
        <div className={s.composer}>
          <Textarea
            classNames={{ root: s.composerInput }}
            variant="unstyled"
            placeholder="Describe the form you want…"
            autosize
            minRows={3}
            maxRows={10}
            value={prompt}
            onChange={(e) => onPromptChange(e.currentTarget.value)}
            disabled={generating}
            data-autofocus
            // Enter sends, Shift+Enter breaks the line — the same contract as
            // every other prompt box people have used.
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey && prompt.trim()) {
                e.preventDefault();
                onGenerate();
              }
            }}
          />

          <div className={s.composerFoot}>
            <ActionIcon
              size={34}
              radius="xl"
              variant="filled"
              color="emerald"
              aria-label="Create my form"
              loading={generating}
              disabled={!prompt.trim()}
              onClick={onGenerate}
            >
              <ArrowUp size={17} />
            </ActionIcon>
          </div>
        </div>

        <p className={s.hint}>
          Quantalog drafts the fields — you can change every one of them later.
        </p>
      </div>

      <div className={s.ideaList}>
        {ideas.map((idea) => (
          <button
            key={idea.label}
            type="button"
            className={s.idea}
            onClick={() => onPromptChange(idea.prompt)}
            disabled={generating}
          >
            {idea.label}
          </button>
        ))}
      </div>

      {generating && (
        <div className={s.working}>
          <Loader size="sm" />
          <span>Drafting your form — this takes a few seconds.</span>
        </div>
      )}

      {error && <p className={s.error}>{error}</p>}

      {/* Quiet, under the composer. A pinned bar here would be a lot of
          furniture around one text box. */}
      <Group gap="xs" justify="center" className={s.escape}>
        <Button
          variant="subtle"
          color="gray"
          size="compact-sm"
          leftSection={<ArrowLeft size={13} />}
          onClick={onBack}
          disabled={generating}
        >
          Back
        </Button>
        <Button
          variant="subtle"
          color="gray"
          size="compact-sm"
          onClick={onSkip}
          disabled={generating}
        >
          Skip this step
        </Button>
      </Group>
    </div>
  );
}
