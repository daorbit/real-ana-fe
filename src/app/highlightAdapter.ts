import { createHighlightJsAdapter, plainTextAdapter, type CodeHighlightAdapter } from "@mantine/code-highlight";
import { whenIdle } from "@/shared/lib/idle";

export const highlightAdapter: CodeHighlightAdapter = {
  loadContext: () =>
    whenIdle(5000)
      .then(() => import("highlight.js"))
      .then((m) => m.default),
  getHighlighter: (hljs) =>
    hljs ? createHighlightJsAdapter(hljs).getHighlighter(null) : plainTextAdapter.getHighlighter(null),
};
