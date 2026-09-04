import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  TextInput, PasswordInput, Button, Title, Text, Alert, Stack, Anchor, Group, Divider,
} from "@mantine/core";
import { PlayCircle } from "lucide-react";
import { useAuth } from "@/features/auth/context";
import { trace } from "@/shared/lib/analytics";
import { AuthBrand } from "@/features/auth/components/AuthBrand";
import GoogleSignInButton from "@/features/auth/components/GoogleSignInButton";
import LinkedInSignInButton from "@/features/auth/components/LinkedInSignInButton";
import { PasswordStrength } from "@/features/auth/components/PasswordStrength";
import { VerifyEmailStep } from "@/features/auth/components/VerifyEmailStep";
import { notify, errMessage } from "@/shared/lib/notify";
import { timeUntil } from "@/shared/lib";
import type { ApiError } from "@/shared/lib/http";
import * as v from "@/shared/lib/validate";
import { CURRENCIES, setStoredCurrency } from "@/shared/lib/currency";
import type { Currency } from "@/shared/types";

type Touched = Record<string, boolean>;

export default function Signup() {
  const { signup, startDemo } = useAuth();
  const nav = useNavigate();
  const [params] = useSearchParams();

  // Carries the currency picked on the landing page's pricing toggle through
  // to Billing, which reads the same storage key — so switching to USD there
  // and clicking "Get started" doesn't land back on INR.
  useEffect(() => {
    const currency = params.get("currency");
    if ((CURRENCIES as readonly string[]).includes(currency ?? "")) {
      setStoredCurrency(currency as Currency);
    }
  }, [params]);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [demoBusy, setDemoBusy] = useState(false);
  const [googleBusy, setGoogleBusy] = useState(false);
  // Set once a code has been sent; switches this page to the verify step.
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);

  const enterDemo = async () => {
    setDemoBusy(true);
    setError(null);
    try {
      await startDemo();
      trace(undefined, "demo_started", "signup", "app");
      nav("/app");
    } catch (err) {
      const e = err as ApiError;
      // The demo is capped per address per day. Say when it frees up rather
      // than leaving "try again later" to be guessed at.
      if (e?.status === 429) {
        const retryAt = e.body?.retryAt ? new Date(String(e.body.retryAt)) : null;
        setError(
          retryAt ? `${e.message} You can start another demo ${timeUntil(retryAt)}.` : e.message
        );
      } else {
        setError(errMessage(err, "Could not start the demo. Try again in a moment."));
      }
    } finally {
      setDemoBusy(false);
    }
  };

  // A field shows its error only once it has been left or the form submitted —
  // validating as someone types their first character is just nagging.
  const [touched, setTouched] = useState<Touched>({});

  const checkFirst = v.all(
    v.required("First name"),
    v.minLength("First name", 2),
    v.maxLength("First name", 40),
  );
  const checkLast = v.maxLength("Last name", 40);

  const errors = {
    firstName: checkFirst(firstName),
    lastName: lastName ? checkLast(lastName) : null,
    email: v.email(email),
    password: v.password(password),
    confirm: v.confirmPassword(password)(confirm),
  };

  const show = (field: keyof typeof errors) =>
    touched[field] ? errors[field] : null;

  const blur = (field: string) => () =>
    setTouched((t) => ({ ...t, [field]: true }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();

    // Reveal every error at once on submit, so nothing is discovered one
    // field at a time.
    setTouched({
      firstName: true,
      lastName: true,
      email: true,
      password: true,
      confirm: true,
    });
    if (Object.values(errors).some(Boolean)) return;

    setBusy(true);
    setError(null);
    try {
      const name = `${firstName.trim()} ${lastName.trim()}`.trim();
      // This only sends a code — the account is created once it's verified.
      await signup(email.trim(), password, name);
      setPendingEmail(email.trim());
    } catch (err) {
      setError(errMessage(err, "Signup failed. Please try again."));
    } finally {
      setBusy(false);
    }
  };

  // The details are held server-side against this address until it's verified,
  // so the code screen needs nothing from this form but the email.
  if (pendingEmail) {
    return (
      <div className="auth-split">
        <AuthBrand />
        <VerifyEmailStep
          email={pendingEmail}
          onBack={() => setPendingEmail(null)}
          onVerified={() => {
            notify.success("Account created. Let's get you tracking.", "Welcome to Quantalog");
            // Straight into setup rather than an empty dashboard — a new account
            // has no workspace, so /app would just show three empty states.
            nav("/app/onboarding");
          }}
        />
      </div>
    );
  }

  return (
    <div className="auth-split">
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
              <Title order={2}>Create your account</Title>
              <Text c="dimmed" size="sm" mt={4}>
                Start tracking in under two minutes.
              </Text>
            </div>

            {error && (
              <Alert color="red" variant="light">
                {error}
              </Alert>
            )}

            {/* The providers come first, and by a wider margin than on login:
                they skip five fields *and* the emailed code, because the
                address is already verified. Paired in a row, as on login. */}
            <Group grow align="stretch" gap="sm" wrap="nowrap">
              <GoogleSignInButton
                label="Google"
                text="signup_with"
                onBusyChange={setGoogleBusy}
                onSuccess={(created) => {
                  if (created) {
                    notify.success("Account created. Let's get you tracking.", "Welcome to Quantalog");
                    nav("/app/onboarding");
                  } else {
                    // The email already had an account — this was a login, and a
                    // returning user does not need the setup wizard.
                    notify.success("Welcome back!", "Logged in");
                    nav("/app");
                  }
                }}
                onError={setError}
              />

              <LinkedInSignInButton label="LinkedIn" onError={setError} />
            </Group>

            <Divider label="or sign up with email" labelPosition="center" />

            <Group grow align="flex-start" gap="sm">
              <TextInput
                label="First name"
                placeholder="Jane"
                size="md"
                autoComplete="given-name"
                value={firstName}
                error={show("firstName")}
                onChange={(e) => setFirstName(e.currentTarget.value)}
                onBlur={blur("firstName")}
              />
         
              <TextInput
                label={
                  <>
                    Last name <span className="auth-optional">optional</span>
                  </>
                }
                placeholder="Doe"
                size="md"
                autoComplete="family-name"
                value={lastName}
                error={show("lastName")}
                onChange={(e) => setLastName(e.currentTarget.value)}
                onBlur={blur("lastName")}
              />
            </Group>

            <TextInput
              label="Work email"
              type="email"
              placeholder="you@company.com"
              size="md"
              autoComplete="email"
              value={email}
              error={show("email")}
              onChange={(e) => setEmail(e.currentTarget.value)}
              onBlur={blur("email")}
            />

            <div>
              <PasswordInput
                label="Password"
                placeholder="At least 8 characters"
                size="md"
                autoComplete="new-password"
                value={password}
                error={show("password")}
                onChange={(e) => setPassword(e.currentTarget.value)}
                onBlur={blur("password")}
              />
              <PasswordStrength value={password} />
            </div>

            <PasswordInput
              label="Confirm password"
              placeholder="Re-enter your password"
              size="md"
              autoComplete="new-password"
              value={confirm}
              error={show("confirm")}
              onChange={(e) => setConfirm(e.currentTarget.value)}
              onBlur={blur("confirm")}
            />

         
            <button
              type="submit"
              className="auth-submit"
              disabled={busy || googleBusy}
            >
              {busy ? <span className="auth-submit-spinner" /> : "Create account"}
            </button>

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
              Have an account?{" "}
              <Anchor component={Link} to="/login" fw={600}>
                Log in
              </Anchor>
            </Text>
          </Stack>
        </motion.form>
      </div>
    </div>
  );
}
