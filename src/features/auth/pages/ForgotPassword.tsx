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


const RESEND_COOLDOWN = 60;

type Step = "request" | "reset" | "totp";

export default function ForgotPassword() {
  const { forgotPassword, resetPassword, resendResetCode, recoverWithTotp } = useAuth();
  const nav = useNavigate();

  const [step, setStep] = useState<Step>("request");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [useBackupCode, setUseBackupCode] = useState(false);

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

  async function submitTotp(e: FormEvent) {
    e.preventDefault();
    const emailErr = v.email(email);
    if (emailErr) {
      setTouched(true);
      return;
    }
    if (v.password(password)) {
      setError("Choose a password that meets the requirements below.");
      return;
    }
    if (!code.trim()) return;

    setBusy(true);
    setError(null);
    try {
      await recoverWithTotp(email.trim().toLowerCase(), code.trim(), password);
      notify.success("Password changed — you're signed in");
      nav("/app");
    } catch (err) {
      setError(errMessage(err, "That code didn't work."));
    } finally {
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
          onSubmit={
            step === "request" ? request : step === "totp" ? submitTotp : (e) => { e.preventDefault(); submit(code); }
          }
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

                <Button
                  className="auth-btn"
                  type="submit"
                  loading={busy}
                  fullWidth
                  size="md"
                >
                  Send reset code
                </Button>

                <Text ta="center" size="sm">
                  <Anchor
                    component="button"
                    type="button"
                    size="sm"
                    c="dimmed"
                    onClick={() => {
                      const invalid = v.email(email);
                      if (invalid) {
                        setTouched(true);
                        return;
                      }
                      setError(null);
                      setStep("totp");
                    }}
                  >
                    Have an authenticator app? Use it instead
                  </Anchor>
                </Text>
              </>
            ) : step === "totp" ? (
              <>
                <div>
                  <Title order={2}>Reset with your authenticator</Title>
                  <Text c="dimmed" size="sm" mt={4}>
                    Enter the account email, a code from your authenticator app (or a
                    backup code), and your new password.
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
                    if (touched) setTouched(false);
                  }}
                  onBlur={() => email && setTouched(true)}
                />

                <div>
                  <PasswordInput
                    label="New password"
                    placeholder="••••••••"
                    size="md"
                    withAsterisk
                    autoComplete="new-password"
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
                    {useBackupCode ? "Backup code" : "Authenticator code"}
                  </Text>
                  {useBackupCode ? (
                    <TextInput
                      placeholder="XXXX-XXXX"
                      size="md"
                      disabled={busy}
                      value={code}
                      onChange={(e) => {
                        setCode(e.currentTarget.value);
                        setError(null);
                      }}
                      styles={{ input: { textAlign: "center", letterSpacing: 2 } }}
                    />
                  ) : (
                    <Center>
                      <PinInput
                        length={6}
                        type="number"
                        inputMode="numeric"
                        size="lg"
                        disabled={busy}
                        value={code}
                        onChange={(val) => {
                          setCode(val);
                          setError(null);
                        }}
                      />
                    </Center>
                  )}
                </div>

                <Button
                  className="auth-btn"
                  type="submit"
                  loading={busy}
                  disabled={!code.trim() || Boolean(v.password(password)) || Boolean(v.email(email))}
                  fullWidth
                  size="md"
                >
                  Set new password
                </Button>

                <Stack gap={6} align="center">
                  <Anchor
                    component="button"
                    type="button"
                    size="sm"
                    c="dimmed"
                    onClick={() => {
                      setUseBackupCode((b) => !b);
                      setCode("");
                      setError(null);
                    }}
                  >
                    {useBackupCode ? "Use an authenticator code instead" : "Use a backup code instead"}
                  </Anchor>
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
                    }}
                  >
                    Email me a code instead
                  </Anchor>
                </Stack>
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
                  className="auth-btn"
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
