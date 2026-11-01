import { CodeBlock } from "@/shared/ui/CodeBlock";
import { codeSample } from "@/features/experiments/lib/experimentDraft";
import type { ExperimentInput } from "@/features/experiments/types";
import { OptInSnippet } from "../OptInSnippet";
import classes from "../Experiments.module.css";

const HOW: Record<ExperimentInput["type"], string> = {
  changes:
    "When a visitor opens a matching page, the tracker picks a group for them and applies that group's changes before the page shows. They keep the same group on every visit.",
  split:
    "Visitors in a variant group are sent to its page as soon as they land, with the address query kept. Everyone else stays on the original page.",
  code: "The tracker picks a group and your code reads it. Use it for anything the page changes cannot do, like a different checkout flow.",
};

export function EditorAside({ draft }: { draft: ExperimentInput }) {
  return (
    <div className={classes.aside}>
      <div className={classes.asideCard}>
        <h4 className={classes.asideTitle}>How it works</h4>
        <p className={classes.asideText}>{HOW[draft.type]}</p>
        <p className={classes.asideText}>
          Results count visitors who saw the test and then reached your goal in the same visit. A winner is called once each
          group has at least 100 visitors and the difference is 95% likely to be real.
        </p>
      </div>
      {draft.type === "code" && (
        <div className={classes.asideCard}>
          <h4 className={classes.asideTitle}>Read the variant in your code</h4>
          <CodeBlock code={codeSample(draft.key)} filename="your site" language="ts" />
        </div>
      )}
      <OptInSnippet siteId={draft.siteId} />
    </div>
  );
}
