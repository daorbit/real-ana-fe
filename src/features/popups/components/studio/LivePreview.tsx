import { useState } from "react";
import { SegmentedControl } from "@mantine/core";
import { FileText, X } from "lucide-react";
import { previewUrl, summarySentence } from "@/features/popups/lib/popupOptions";
import type { PopupInput } from "@/features/popups/types";
import classes from "@/features/popups/components/studio/LivePreview.module.css";

type Device = "desktop" | "phone";

const DEVICES = [
  { value: "desktop", label: "Desktop" },
  { value: "phone", label: "Phone" },
];

function previewAddress(draft: PopupInput, domain: string): string {
  const host = domain.replace(/^https?:\/\//, "").replace(/\/$/, "") || "yoursite.com";
  const path = draft.pages.mode === "include" ? (draft.pages.patterns[0] ?? "").replace(/\*/g, "") : "";
  return `${host}${path}`;
}

export function LivePreview({ draft, domain }: { draft: PopupInput; domain: string }) {
  const [device, setDevice] = useState<Device>(draft.devices === "mobile" ? "phone" : "desktop");

  return (
    <section className={classes.panel}>
      <div className={classes.head}>
        <div>
          <div className={classes.title}>Live preview</div>
          <div className={classes.sub}>The real form. Submitting here sends nothing.</div>
        </div>
        <SegmentedControl size="xs" data={DEVICES} value={device} onChange={(v) => setDevice(v as Device)} />
      </div>

      <div className={classes.stage}>
        <div className={classes.device} data-device={device}>
          <div className={classes.chrome}>
            <span className={classes.dot} />
            <span className={classes.dot} />
            <span className={classes.dot} />
            <span className={classes.url}>{previewAddress(draft, domain)}</span>
          </div>
          <div className={classes.viewport}>
            <div className={classes.page} aria-hidden>
              <span className={classes.line} data-w="hero" />
              <span className={classes.line} data-w="long" />
              <span className={classes.line} data-w="mid" />
              <div className={classes.blocks}>
                <span className={classes.block} />
                <span className={classes.block} />
                <span className={classes.block} />
              </div>
              <span className={classes.line} data-w="long" />
              <span className={classes.line} data-w="short" />
            </div>
            {draft.layout === "modal" && <span className={classes.scrim} />}
            <div className={classes.popup} data-layout={draft.layout}>
              <span className={classes.close} aria-hidden>
                <X size={13} />
              </span>
              <div className={classes.popupBody}>
                {draft.formId ? (
                  <iframe key={draft.formId} src={previewUrl(draft.formId)} title="Form preview" className={classes.frame} loading="lazy" />
                ) : (
                  <div className={classes.placeholder}>
                    <span className={classes.placeholderIcon}>
                      <FileText size={18} />
                    </span>
                    Pick a form to see it here.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <p className={classes.summary}>{summarySentence(draft)}</p>
    </section>
  );
}
