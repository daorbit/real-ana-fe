import type { CSSProperties, ReactNode } from "react";
import classes from "./Checkout.module.css";

export function CheckoutProduct({
  mark,
  name,
  meta,
  price,
  per,
  accent,
}: {
  mark: ReactNode;
  name: string;
  meta: string;
  price?: string;
  per?: string;
  accent?: string;
}) {
  return (
    <div
      className={classes.product}
      style={accent ? ({ "--product-accent": accent } as CSSProperties) : undefined}
    >
      <span className={classes.productMark}>{mark}</span>
      <div className={classes.productText}>
        <h3 className={classes.productName}>{name}</h3>
        <p className={classes.productMeta}>{meta}</p>
      </div>
      {price && (
        <div className={classes.productPrice}>
          <span className={classes.productPriceValue}>{price}</span>
          {per && <span className={classes.productPricePer}>{per}</span>}
        </div>
      )}
    </div>
  );
}
