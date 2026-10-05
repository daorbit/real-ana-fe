import type { ReactNode } from "react";
import classes from "./Checkout.module.css";

export function CheckoutProduct({
  mark,
  eyebrow,
  name,
  meta,
  price,
  per,
}: {
  mark: ReactNode;
  eyebrow?: string;
  name: string;
  meta: string;
  price?: string;
  per?: string;
}) {
  return (
    <header className={classes.product}>
      <span className={classes.productMark}>{mark}</span>
      <div className={classes.productText}>
        {eyebrow && <span className={classes.eyebrow}>{eyebrow}</span>}
        <h3 className={classes.productName}>{name}</h3>
        <p className={classes.productMeta}>{meta}</p>
      </div>
      {price && (
        <div className={classes.productPrice}>
          <span className={classes.productPriceValue}>{price}</span>
          {per && <span className={classes.productPricePer}>{per}</span>}
        </div>
      )}
    </header>
  );
}
