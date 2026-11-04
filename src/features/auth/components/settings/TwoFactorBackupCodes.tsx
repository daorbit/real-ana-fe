import { Button, CopyButton } from "@mantine/core";
import { Check, Copy, Download } from "lucide-react";
import { SecureDialogButton } from "../SecureDialog";
import { downloadBackupCodes } from "./twoFactorSetup";
import classes from "./TwoFactorSetup.module.css";

export function TwoFactorBackupCodes({ codes, onDone }: { codes: string[]; onDone: () => void }) {
  return (
    <>
      <ol className={classes.codes} translate="no">
        {codes.map((c) => (
          <li key={c} className={classes.code}>{c}</li>
        ))}
      </ol>

      <div className={classes.actions}>
        <CopyButton value={codes.join("\n")} timeout={1500}>
          {({ copied, copy }) => (
            <Button
              variant="default"
              radius="xl"
              leftSection={copied ? <Check size={15} /> : <Copy size={15} />}
              onClick={copy}
            >
              {copied ? "Copied" : "Copy all"}
            </Button>
          )}
        </CopyButton>
        <Button
          variant="default"
          radius="xl"
          leftSection={<Download size={15} />}
          onClick={() => downloadBackupCodes(codes)}
        >
          Download
        </Button>
      </div>

      <SecureDialogButton onClick={onDone}>I've saved them</SecureDialogButton>
    </>
  );
}
