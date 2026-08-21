import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  TextInput, PasswordInput, Button, Title, Text, Alert, Stack, Anchor, Divider,
  Group,
} from "@mantine/core";
import { PlayCircle } from "lucide-react";
import { useAuth } from "@/features/auth/context";
import { AuthBrand } from "@/features/auth/components/AuthBrand";
import GoogleSignInButton from "@/features/auth/components/GoogleSignInButton";
import LinkedInSignInButton from "@/features/auth/components/LinkedInSignInButton";
import { turnstileConfigured } from "@/features/auth/components/TurnstileWidget";
import { VerifyDialog } from "@/features/auth/components/VerifyDialog";
import { notify, errMessage } from "@/shared/lib/notify";
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

  const enterDemo = async () => {
    setDemoBusy(true);
    setError(null);
    try {
      await startDemo();
      // No toast here: the app boots straight into a loading overlay, so a
      // notification would land on top of it and read as an error. The sidebar
      // carries a persistent "Demo mode" card, which is the better place to say
      // it anyway — it's still there a minute later.
      nav("/app");
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
      nav("/app");
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
      <AuthBrand />
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

            {/* The two providers share a row, above the form: both are one
                click against two fields and a password, and putting them under
                the form would make the slower path look like the intended one.
                `grow` splits the width evenly, which also gives the Google
                button a measured box to size its invisible GIS overlay to. */}
            <Group grow align="stretch" gap="sm" wrap="nowrap">
              <GoogleSignInButton
                label="Google"
                text="signin_with"
                onBusyChange={setGoogleBusy}
                onSuccess={(created) => {
                  notify.success(
                    created ? "Your account is ready." : "Welcome back!",
                    created ? "Signed up with Google" : "Logged in"
                  );
                  nav("/app");
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

            {/* Sign-up is the primary thing to offer someone who can't log in, so
                it gets the emphasis. The demo sits beside it as a quieter
                alternative — it was a full-width button competing with Google,
                which is far more weight than "have a look around" deserves. */}
            {/* A real button so the demo is actually findable, but subtle and
                not full width — it should read as a third option, not as a peer
                of Google and the password form. */}
            <Group justify="center" mt={2}>
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
