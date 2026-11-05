import type { ReactNode } from "react";
import studio from "@/features/popups/components/studio/PopupStudio.module.css";

export function EditorSection({ title, text, children }: { title: string; text: string; children: ReactNode }) {
  return (
    <section className={studio.section}>
      <div className={studio.sectionHead}>
        <div>
          <h3 className={studio.sectionTitle}>{title}</h3>
          <p className={studio.sectionText}>{text}</p>
        </div>
      </div>
      <div className={studio.sectionBody}>{children}</div>
    </section>
  );
}
