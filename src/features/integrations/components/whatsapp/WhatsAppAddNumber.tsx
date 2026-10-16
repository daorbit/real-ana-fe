import { useState } from "react";
import { Anchor, Button, PinInput, Text, TextInput } from "@mantine/core";
import { Send } from "lucide-react";
import type { useWhatsAppConnection } from "../../hooks/useWhatsAppConnection";
import classes from "./WhatsApp.module.css";

export function WhatsAppAddNumber({ wa }: { wa: ReturnType<typeof useWhatsAppConnection> }) {
  const [phone, setPhone] = useState("");
  const [label, setLabel] = useState("");
  const [code, setCode] = useState("");

  if (wa.pendingPhone) {
    return (
      <div className={classes.add}>
        <Text size="sm" fw={600}>
          Enter the code sent to +{wa.pendingPhone}
        </Text>
        <Text size="xs" c="dimmed">
          Open WhatsApp on that phone. The 6-digit code expires in 10 minutes.
        </Text>
        <div className={classes.codeRow}>
          <PinInput length={6} type="number" oneTimeCode value={code} onChange={setCode} aria-label="Verification code" />
          <Button
            loading={wa.verifying}
            disabled={code.length !== 6}
            onClick={async () => {
              if (await wa.verify(code)) {
                setCode("");
                setPhone("");
                setLabel("");
              }
            }}
          >
            Verify
          </Button>
        </div>
        <Text size="xs" c="dimmed">
          Wrong number?{" "}
          <Anchor component="button" type="button" size="xs" onClick={wa.cancelPending}>
            Start again
          </Anchor>{" "}
          · Didn&apos;t get it?{" "}
          <Anchor component="button" type="button" size="xs" onClick={() => void wa.sendCode(wa.pendingPhone ?? "", label)}>
            Resend code
          </Anchor>
        </Text>
      </div>
    );
  }

  return (
    <div className={classes.add}>
      <Text size="sm" fw={600}>
        Add a number
      </Text>
      <div className={classes.fields}>
        <TextInput
          className={classes.phone}
          label="WhatsApp number"
          placeholder="+91 98765 43210"
          value={phone}
          onChange={(e) => setPhone(e.currentTarget.value)}
        />
        <TextInput
          className={classes.label}
          label="Name (optional)"
          placeholder="Priya, Sales team…"
          value={label}
          onChange={(e) => setLabel(e.currentTarget.value)}
        />
        <Button
          className={classes.sendCode}
          leftSection={<Send size={15} />}
          loading={wa.sendingCode}
          disabled={phone.replace(/[^\d]/g, "").length < 8}
          onClick={() => void wa.sendCode(phone, label)}
        >
          Send code
        </Button>
      </div>
      <Text size="xs" c="dimmed">
        Include the country code. We send a 6-digit code to that WhatsApp, so only people who agree get messages.
      </Text>
    </div>
  );
}
