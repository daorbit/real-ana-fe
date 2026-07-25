import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { motion } from "framer-motion";
import {
  PinInput, Button, Title, Text, Alert, Stack, Group, Anchor, Center,
} from "@mantine/core";
import { MailCheck, ArrowLeft } from "lucide-react";
import { useAuth } from "../auth";
import { errMessage } from "../notify";
import type { ApiError } from "../api";

/** Seconds to wait before "resend" becomes available. Matches the server's gap. */
const RESEND_COOLDOWN = 60;

/**
 * The second half of signup: prove the emailed code.
 *
 * The account does not exist yet at this point — the details are held server-
 * side and only become a user when a code checks out. So leaving this screen
 * abandons the signup rather than orphaning a half-made account, which is why
 * "use a different email" simply goes back rather than needing to clean
 * anything up.
 */
export function VerifyEmailStep({
  email,
  onBack,
  onVerified,
}: {
  email: string;
  onBack: () => void;
  onVerified: () => void;
}) {
  const { verifySignup, resendSignupCode } = useAuth();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN);

  // Guards the auto-submit below from firing twice for one filled code.
  const submitted = useRef(false);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  const submit = async (value: string) => {
    if (value.length !== 6 || busy) return;
    submitted.current = true;
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      await verifySignup(email, value);
      onVerified();
    } catch (err) {
      const e = err as ApiError;
      // An expired code or an exhausted attempt budget can't be recovered from
      // this screen — the pending signup is gone server-side, so send them back
      // to re-enter their details rather than letting them type into a void.
      if (e?.body?.restart) {
        setError(`${e.message} Taking you back…`);
        setTimeout(onBack, 2200);
        return;
      }
      const left = typeof e?.body?.attemptsLeft === "number" ? e.body.attemptsLeft : null;
      setError(
        left !== null
          ? `${e.message} — ${left} attempt${left === 1 ? "" : "s"} left.`
          : errMessage(err, "Could not verify that code.")
      );
      setCode("");
      submitted.current = false;
    } finally {
      setBusy(false);
    }
  };

  const resend = async () => {
    setResending(true);
    setError(null);
    setNotice(null);
    try {
      await resendSignupCode(email);
      setNotice("A new code is on its way.");
      setCode("");
      submitted.current = false;
      setCooldown(RESEND_COOLDOWN);
    } catch (err) {
      const e = err as ApiError;
      if (e?.body?.restart) {
        setError(`${e.message} Taking you back…`);
        setTimeout(onBack, 2200);
        return;
      }
      // The server enforces its own gap; mirror whatever it asks for.
      if (typeof e?.body?.retryInSeconds === "number") setCooldown(e.body.retryInSeconds);
      setError(errMessage(err, "Could not send a new code."));
    } finally {
      setResending(false);
    }
  };

  const onFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    submit(code);
  };

  return (
    <div className="auth-panel">
      <motion.form
        className="auth-form"
        onSubmit={onFormSubmit}
        noValidate
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Stack gap="lg">
          <div>
            <Group gap="sm" mb={6}>
              <MailCheck size={22} />
              <Title order={2}>Check your email</Title>
            </Group>
            <Text c="dimmed" size="sm">
              We sent a 6-digit code to <b>{email}</b>. Enter it below to finish
              creating your account.
            </Text>
          </div>

          {error && <Alert color="red" variant="light">{error}</Alert>}
          {notice && <Alert color="green" variant="light">{notice}</Alert>}

          <Center>
            <PinInput
              length={6}
              type="number"
              inputMode="numeric"
              size="lg"
              oneTimeCode
              autoFocus
              disabled={busy}
              value={code}
              onChange={(v) => {
                setCode(v);
                setError(null);
              }}
              // Submitting the moment the last digit lands saves a click on the
              // one screen where the user is already copying between devices.
              onComplete={(v) => {
                if (!submitted.current) submit(v);
              }}
            />
          </Center>

          <Button
            type="submit"
            loading={busy}
            disabled={code.length !== 6}
            fullWidth
            size="md"
          >
            Verify and continue
          </Button>

          <Group justify="center" gap={6}>
            <Text c="dimmed" size="sm">Didn't get it?</Text>
            {cooldown > 0 ? (
              <Text c="dimmed" size="sm">Resend in {cooldown}s</Text>
            ) : (
              <Anchor component="button" type="button" size="sm" fw={600} onClick={resend}>
                {resending ? "Sending…" : "Send a new code"}
              </Anchor>
            )}
          </Group>

          <Text c="dimmed" size="xs" ta="center">
            Check your spam folder — messages from a new sender often land there.
          </Text>

          <Button
            variant="subtle"
            color="gray"
            size="sm"
            leftSection={<ArrowLeft size={15} />}
            onClick={onBack}
            disabled={busy}
          >
            Use a different email
          </Button>
        </Stack>
      </motion.form>
    </div>
  );
}
