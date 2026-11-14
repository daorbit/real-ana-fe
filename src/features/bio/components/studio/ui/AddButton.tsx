import { forwardRef, type ComponentPropsWithoutRef } from "react";
import { Plus } from "lucide-react";
import classes from "./List.module.css";

export const AddButton = forwardRef<HTMLButtonElement, ComponentPropsWithoutRef<"button"> & { label?: string }>(function AddButton(
  { label = "Add", ...props },
  ref,
) {
  return (
    <button ref={ref} type="button" className={classes.addButton} {...props}>
      <Plus size={14} strokeWidth={2.4} />
      {label}
    </button>
  );
});
