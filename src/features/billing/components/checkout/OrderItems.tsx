import type { ReactNode } from "react";
import s from "./CheckoutPage.module.css";

export type OrderItem = { key: string; mark: ReactNode; name: string; sub: string; value: string };

export function OrderItems({ items }: { items: OrderItem[] }) {
  return (
    <ul className={s.items}>
      {items.map((item) => (
        <li key={item.key} className={s.item}>
          <span className={s.itemMark}>{item.mark}</span>
          <span className={s.itemText}>
            <span className={s.itemName}>{item.name}</span>
            <span className={s.itemSub}>{item.sub}</span>
          </span>
          <span className={s.itemValue}>{item.value}</span>
        </li>
      ))}
    </ul>
  );
}
