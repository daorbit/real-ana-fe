import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  TextInput, PasswordInput, PinInput, Button, Title, Text, Alert, Stack,
  Anchor, Group, Center,
} from "@mantine/core";
import { ArrowLeft, MailCheck } from "lucide-react";
import { useAuth } from "@/features/auth/context";
import { AuthBrand } from "@/features/auth/components/AuthBrand";
import { PasswordStrength } from "@/features/auth/components/PasswordStrength";
import { notify, errMessage } from "@/shared/lib/notify";
import type { ApiError } from "@/shared/lib/http";
import * as v from "@/shared/lib/validate";

/**
 * Password reset, in two steps on one page.
 *
 * A code rather than a reset link, matching the signup flow: a link is a bearer
 * credential living in a URL, and URLs leak into history, referrers, chat
 * previews and mail scanners that fetch everything they see. A code has to be
 * read by a person and typed back.
 *
 * The first step never says whether the address has an account — the server
 * answers identically either way, and this screen has to preserve that or it
 * hands back the enumeration oracle the API refuses to be.
 */

/** Matches the server's resend spacing, so the button reflects the real rule. */
const RESEND_COOLDOWN = 60;

type Step = "request" | "reset";

export default function ForgotPassword() {
  const { forgotPassword, resetPassword, resendResetCode } = useAuth();
  const nav = useNavigate();

  const [step, setStep] = useState<Step>("request");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [touched, setTouched] = useState(false);

  // Guards the auto-submit from firing twice for one filled code.
  const submitted = useRef(false);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  const emailError = touched ? v.email(email) : null;
  const passwordError = password ? v.password(password) : null;

  async function request(e: FormEvent) {
    e.preventDefault();
    const invalid = v.email(email);
    if (invalid) {
      // Only now does the field earn an error — on load it has been shown to
      // nobody and complained at nobody.
      setTouched(true);
      setError(null);
      return;
    }

    setBusy(true);
    setError(null);
    try {
      await forgotPassword(email.trim().toLowerCase());
      setStep("reset");
      setCooldown(RESEND_COOLDOWN);
    } catch (err) {
      // Only a transport or server fault reaches here — an unknown address
      // resolves successfully by design.
      setError(errMessage(err, "Could not send the code. Please try again."));
    } finally {
      setBusy(false);
    }
  }

  async function submit(value: string) {
    if (submitted.current) return;
    if (v.password(password)) {
      setError("Choose a password that meets the requirements below.");
      return;
    }

    submitted.current = true;
    setBusy(true);
    setError(null);
    try {
      await resetPassword(email.trim().toLowerCase(), value, password);
      notify.success("Password changed — you're signed in");
      nav("/app");
    } catch (err) {
      const e = err as ApiError;
      const body = e.body as { restart?: boolean; attemptsLeft?: number } | undefined;

      // An expired or exhausted code cannot be retried, so send them back to
      // ask for a new one rather than leaving them poking at a dead form.
      if (body?.restart) {
        setStep("request");
        setCode("");
        setCooldown(0);
      }
      setError(errMessage(err, "Could not reset your password."));
      setCode("");
    } finally {
      submitted.current = false;
      setBusy(false);
    }
  }

  async function resend() {
    setResending(true);
    setError(null);
    setNotice(null);
    try {
      await resendResetCode(email.trim().toLowerCase());
      setNotice("A new code is on its way.");
      setCooldown(RESEND_COOLDOWN);
    } catch (err) {
      const e = err as ApiError;
      const retry = (e.body as { retryInSeconds?: number } | undefined)?.retryInSeconds;
      if (retry) setCooldown(retry);
      setError(errMessage(err, "Could not send a new code."));
    } finally {
      setResending(false);
    }
  }

  return (
    <div className="auth-split">
      <AuthBrand />

      <div className="auth-panel">
        <motion.form
          className="auth-form"
          noValidate
          onSubmit={step === "request" ? request : (e) => { e.preventDefault(); submit(code); }}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        >
          <Stack gap="lg">
            <div>
              <Anchor
                component={Link}
                to="/login"
                size="sm"
                c="dimmed"
                style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
              >
                <ArrowLeft size={14} />
                Back to login
              </Anchor>
            </div>

            {step === "request" ? (
              <>
                <div>
                  <Title order={2}>Reset your password</Title>
                  <Text c="dimmed" size="sm" mt={4}>
                    Enter the address you signed up with and we&apos;ll send you a
                    6-digit code.
                  </Text>
                </div>

                {error && <Alert color="red" variant="light">{error}</Alert>}

                <TextInput
                  label="Email"
                  placeholder="you@company.com"
                  size="md"
                  withAsterisk
                  autoComplete="email"
                  autoFocus
                  value={email}
                  error={emailError}
                  onChange={(e) => {
                    setEmail(e.currentTarget.value);
                    // Clear as they correct it, rather than leaving a stale
                    // complaint sitting under a field they are already fixing.
                    if (touched) setTouched(false);
                  }}
                  onBlur={() => email && setTouched(true)}
                />

                <Button type="submit" loading={busy} fullWidth size="md">
                  Send reset code
                </Button>
              </>
            ) : (
              <>
                <div>
                  <Group gap={8} mb={4}>
                    <MailCheck size={22} />
                    <Title order={2}>Check your email</Title>
                  </Group>
                  <Text c="dimmed" size="sm">
                    If <b>{email}</b> has an account, a 6-digit code is on its way.
                    Enter it below with your new password.
                  </Text>
                </div>

                {error && <Alert color="red" variant="light">{error}</Alert>}
                {notice && <Alert color="green" variant="light">{notice}</Alert>}

                {/* The strength meter belongs to the field above it, so the two
                    are one block — as siblings in the stack they drift apart by
                    the stack's own gap. */}
                <div>
                  <PasswordInput
                    label="New password"
                    placeholder="••••••••"
                    size="md"
                    withAsterisk
                    autoComplete="new-password"
                    autoFocus
                    value={password}
                    error={passwordError}
                    onChange={(e) => {
                      setPassword(e.currentTarget.value);
                      setError(null);
                    }}
                  />
                  {password && (
                    <div style={{ marginTop: 8 }}>
                      <PasswordStrength value={password} />
                    </div>
                  )}
                </div>

                <div>
                  <Text size="sm" fw={500} mb={8}>
                    Reset code
                  </Text>
                  <Center>
                    <PinInput
                      length={6}
                      type="number"
                      inputMode="numeric"
                      size="lg"
                      oneTimeCode
                      disabled={busy}
                      value={code}
                      onChange={(val) => {
                        setCode(val);
                        setError(null);
                      }}
                      // Only auto-submit once the password is valid — firing on
                      // the last digit with an empty password would burn one of
                      // five attempts on a mistake the user has not made yet.
                      onComplete={(val) => {
                        if (!v.password(password)) submit(val);
                      }}
                    />
                  </Center>
                </div>

                <Button
                  type="submit"
                  loading={busy}
                  disabled={code.length !== 6 || Boolean(v.password(password))}
                  fullWidth
                  size="md"
                >
                  Set new password
                </Button>

                {/* Both escape hatches together, tight — spread across the
                    stack's gap they read as two unrelated afterthoughts. */}
                <Stack gap={6} align="center">
                  <Group justify="center" gap={6}>
                    <Text c="dimmed" size="sm">Didn&apos;t get it?</Text>
                    {cooldown > 0 ? (
                      <Text c="dimmed" size="sm">Resend in {cooldown}s</Text>
                    ) : (
                      <Anchor
                        component="button"
                        type="button"
                        size="sm"
                        fw={600}
                        onClick={resend}
                      >
                        {resending ? "Sending…" : "Send a new code"}
                      </Anchor>
                    )}
                  </Group>

                  <Anchor
                    component="button"
                    type="button"
                    size="sm"
                    c="dimmed"
                    onClick={() => {
                      setStep("request");
                      setCode("");
                      setPassword("");
                      setError(null);
                      setNotice(null);
                    }}
                  >
                    Use a different email
                  </Anchor>
                </Stack>
              </>
            )}
          </Stack>
        </motion.form>
      </div>
    </div>
  );
}
