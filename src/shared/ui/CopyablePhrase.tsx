import { Code, CopyButton, Tooltip, UnstyledButton } from "@mantine/core";
import classes from "./CopyablePhrase.module.css";

export function CopyablePhrase({ value }: { value: string }) {
  return (
    <CopyButton value={value} timeout={1500}>
      {({ copied, copy }) => (
        <Tooltip label={copied ? "Copied" : "Click to copy"} withArrow>
          <UnstyledButton className={classes.phrase} onClick={copy} aria-label={`Copy ${value}`}>
            <Code>{value}</Code>
          </UnstyledButton>
        </Tooltip>
      )}
    </CopyButton>
  );
}
