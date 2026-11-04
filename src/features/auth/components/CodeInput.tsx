import type { Ref } from "react";
import { PinInput, type PinInputProps } from "@mantine/core";
import classes from "./SecureDialog.module.css";

const CODE_CLASSES = {
  root: classes.codeRoot,
  pinInput: classes.codeCell,
  input: classes.codeField,
};

export function CodeInput({ ref, ...props }: PinInputProps & { ref?: Ref<HTMLInputElement> }) {
  return <PinInput ref={ref} type="number" size="lg" gap={8} classNames={CODE_CLASSES} {...props} />;
}
