import type { ReactNode } from "react";
import s from "./CheckoutPage.module.css";

export function CheckoutBlock({
  title,
  hint,
  description,
  children,
}: {
  title: string;
  hint?: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className={s.block}>
      <div className={s.blockHead}>
        <h3 className={s.blockTitle}>
          {title}
          {hint && <span className={s.blockHint}>{hint}</span>}
        </h3>
        {description && <p className={s.blockDesc}>{description}</p>}
      </div>
      {children}
    </section>
  );
}
