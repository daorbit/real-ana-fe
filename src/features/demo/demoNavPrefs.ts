import type { NavPrefs } from "@/shared/types";
import { DEMO_CALL_URL } from "@/shared/lib/docsSlugs";
import { DEMO_CALL_ICON } from "@/features/demo/demoImages";

export const demoNavPrefs: NavPrefs = {
  hidden: [],
  pinned: [],
  links: [
    {
      id: "demo-link-call",
      label: "Book a call",
      url: `${DEMO_CALL_URL}?layout=page`,
      mode: "internal",
      slug: "book-a-call",
      logoUrl: DEMO_CALL_ICON,
    },
    {
      id: "demo-link-docs",
      label: "Quantalog docs",
      url: "https://quantalog.daorbit.in/docs",
      mode: "external",
      slug: "quantalog-docs",
      logoUrl: "",
    },
  ],
};
