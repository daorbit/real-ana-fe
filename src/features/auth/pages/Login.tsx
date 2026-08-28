import { useRef, useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  TextInput, PasswordInput, Button, Title, Text, Alert, Stack, Anchor, Divider,
  Group,
} from "@mantine/core";
import { PlayCircle } from "lucide-react";
import { useAuth } from "@/features/auth/context";
import { trace } from "@/shared/lib/analytics";
import { AuthBrand } from "@/features/auth/components/AuthBrand";
import GoogleSignInButton from "@/features/auth/components/GoogleSignInButton";
import LinkedInSignInButton from "@/features/auth/components/LinkedInSignInButton";
import { turnstileConfigured } from "@/features/auth/components/TurnstileWidget";
import { VerifyDialog } from "@/features/auth/components/VerifyDialog";
import { notify, errMessage } from "@/shared/lib/notify";
import { consumeReturnPath } from "@/shared/lib/session";
import { getLastUser, forgetLastUser } from "@/features/auth/lastUser";
import { LastUserCard } from "@/features/auth/components/LastUserCard";
import { timeUntil } from "@/shared/lib";
import type { ApiError } from "@/shared/lib/http";
import * as v from "@/shared/lib/validate";

export default function Login() {
  const { login, startDemo } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [demoBusy, setDemoBusy] = useState(false);
  const [googleBusy, setGoogleBusy] = useState(false);
  // Whether the challenge modal is open. The token itself is never held in
  // state: it goes straight from the widget's callback into the login call,
  // and the widget unmounts with the modal, so each attempt gets a fresh one.
  const [verifying, setVerifying] = useState(false);

  // Whoever signed in last on this browser, offered as a one-tap way back in.
  // Hidden once the user starts typing an address, or clears it themselves.
  const [lastUser, setLastUser] = useState(() => getLastUser());
  const passwordRef = useRef<HTMLInputElement>(null);

  const continueAsLastUser = () => {
    if (!lastUser) return;
    setEmail(lastUser.email);
    setTouched((t) => ({ ...t, email: true }));
    passwordRef.current?.focus();
  };

  const forgetUser = () => {
    forgetLastUser();
    setLastUser(null);
  };

  // After any successful sign-in, prefer the page a session-expiry bounced the
  // user off; fall back to the dashboard.
  const goAfterLogin = () => nav(consumeReturnPath() ?? "/app");

  const enterDemo = async () => {
    setDemoBusy(true);
    setError(null);
    try {
      await startDemo();
      trace(undefined, "demo_started", "login", "app");
      // No toast here: the app boots straight into a loading overlay, so a
      // notification would land on top of it and read as an error. The sidebar
      // carries a persistent "Demo mode" card, which is the better place to say
      // it anyway — it's still there a minute later.
      goAfterLogin();
    } catch (err) {
      const e = err as ApiError;
      // The demo is capped per address per day. Say when it frees up rather
      // than leaving "try again later" to be guessed at.
      if (e?.status === 429) {
        const retryAt = e.body?.retryAt ? new Date(String(e.body.retryAt)) : null;
        setError(
          retryAt
            ? `${e.message} You can start another demo ${timeUntil(retryAt)}.`
            : e.message
        );
      } else {
        setError(errMessage(err, "Could not start the demo. Try again in a moment."));
      }
    } finally {
      setDemoBusy(false);
    }
  };
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const errors = {
    email: v.email(email),
    // Presence only. Signup's strength rules must not apply here: accounts
    // created before those rules have shorter passwords, and refusing them at
    // login would lock people out of working accounts.
    password: password ? null : "Password is required",
  };

  const show = (field: keyof typeof errors) =>
    touched[field] ? errors[field] : null;

  const blur = (field: string) => () =>
    setTouched((t) => ({ ...t, [field]: true }));

  /**
   * Log in with a token the modal has just produced.
   *
   * Split out from `submit` because the challenge now sits between the two:
   * the click validates the form and opens the modal, and this runs once
   * Cloudflare has answered. The token is passed in rather than read from
   * state — it arrives in the widget's callback, and state set in that same
   * tick would not be visible here yet.
   */
  const finishLogin = async (token?: string) => {
    setVerifying(false);
    setBusy(true);
    setError(null);
    try {
      await login(email.trim(), password, token);
      notify.success("Welcome back!", "Logged in");
      goAfterLogin();
    } catch (err) {
      setError(errMessage(err, "Login failed. Check your email and password."));
      // The token is spent either way — Cloudflare refuses a second use — and
      // the widget is unmounted with the modal, so the next attempt opens a
      // fresh one. Nothing to reset here.
    } finally {
      setBusy(false);
    }
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();

    setTouched({ email: true, password: true });
    if (Object.values(errors).some(Boolean)) return;

    setError(null);
    if (!turnstileConfigured()) {
      void finishLogin();
      return;
    }
    setVerifying(true);
  };

  return (
    <div className="auth-split">
      {/* A quick way back in for the last account on this browser, floated in
          the corner rather than wedged into the form — it is an offer, not a
          step. Gone the moment the reader starts typing an address. */}
      {lastUser && !email && (
        <div className="last-user-slot">
          <LastUserCard
            user={lastUser}
            onContinue={continueAsLastUser}
            onForget={forgetUser}
          />
        </div>
      )}
      <AuthBrand onDemo={enterDemo} demoBusy={demoBusy} />
      <div className="auth-panel">
        <motion.form
          className="auth-form"
          onSubmit={submit}
          noValidate
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Stack gap="lg">
            <div>
              <Title order={2}>Welcome back</Title>
              <Text c="dimmed" size="sm" mt={4}>
                Log in to your Quantalog dashboard.
              </Text>
            </div>

            {error && (
              <Alert color="red" variant="light">
                {error}
              </Alert>
            )}

            <Group grow align="stretch" gap="sm" wrap="nowrap">
              <GoogleSignInButton
                label="Google"
                text="signin_with"
                oneTap
                onBusyChange={setGoogleBusy}
                onSuccess={(created) => {
                  notify.success(
                    created ? "Your account is ready." : "Welcome back!",
                    created ? "Signed up with Google" : "Logged in"
                  );
                  goAfterLogin();
                }}
                onError={setError}
              />

              <LinkedInSignInButton label="LinkedIn" onError={setError} />
            </Group>

            <Divider label="or use your email" labelPosition="center" />

            <TextInput
              label="Email"
              type="email"
              placeholder="you@company.com"
              size="md"
              withAsterisk
              autoComplete="email"
              value={email}
              error={show("email")}
              onChange={(e) => setEmail(e.currentTarget.value)}
              onBlur={blur("email")}
            />

            <div>
              <PasswordInput
                ref={passwordRef}
                label="Password"
                placeholder="••••••••"
                size="md"
                withAsterisk
                autoComplete="current-password"
                value={password}
                error={show("password")}
                onChange={(e) => setPassword(e.currentTarget.value)}
                onBlur={blur("password")}
              />
              {/* Under the field rather than on the label row: the label row
                  fights the required asterisk, and this is where the eye
                  already is once the password has been typed and rejected. */}
              <Group justify="flex-end" mt={6}>
                <Anchor component={Link} to="/forgot-password" size="xs" fw={500}>
                  Forgot password?
                </Anchor>
              </Group>
            </div>

            <Button
              type="submit"
              loading={busy || verifying}
              disabled={googleBusy}
              fullWidth
              size="md"
            >
              Log in
            </Button>

            {/* The demo's real home is the brand panel now. That panel is
                hidden below 900px, so this stays as the mobile-only fallback —
                without it the demo would be unreachable on a phone. */}
            <Group justify="center" mt={2} className="auth-demo-fallback">
              <Button
                variant="subtle"
                color="gray"
                size="sm"
                leftSection={<PlayCircle size={15} />}
                loading={demoBusy}
                onClick={enterDemo}
              >
                Explore the live demo
              </Button>
            </Group>

            <Text c="dimmed" size="sm" ta="center">
              No account?{" "}
              <Anchor component={Link} to="/signup" fw={600}>
                Sign up free
              </Anchor>
            </Text>
          </Stack>
        </motion.form>
      </div>
 
      <VerifyDialog
        opened={verifying}
        onCancel={() => setVerifying(false)}
        onVerify={(token) => void finishLogin(token)}
      />
    </div>
  );
}
