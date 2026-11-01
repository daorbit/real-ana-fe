import { CodeBlock } from "@/shared/ui/CodeBlock";
import { optInSnippet } from "@/features/experiments/lib/experimentDraft";
import classes from "./Experiments.module.css";

export function OptInSnippet({ siteId }: { siteId: string }) {
  return (
    <div className={classes.asideCard}>
      <h4 className={classes.asideTitle}>Turn tests on for the site</h4>
      <p className={classes.asideText}>
        Add <code>data-experiments="on"</code> to your Quantalog tracking tag. It lets the tracker apply a variant before the
        page shows, so visitors never see the original flash first. Sites without it are not affected.
      </p>
      <CodeBlock code={optInSnippet(siteId)} filename="tracking tag" />
    </div>
  );
}
