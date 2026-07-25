import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  TextInput, PasswordInput, Button, Title, Text, Alert, Stack, Anchor, Divider,
} from "@mantine/core";
import { PlayCircle } from "lucide-react";
import { useAuth } from "../auth";
import { AuthBrand } from "../components/AuthBrand";
import GoogleSignInButton from "../components/GoogleSignInButton";
import { notify, errMessage } from "../notify";
import { timeUntil } from "../utils";
import type { ApiError } from "../api";
import * as v from "../utils/validate";

export default function Login() {
  const { login, startDemo } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [demoBusy, setDemoBusy] = useState(false);
  const [googleBusy, setGoogleBusy] = useState(false);

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

  const submit = async (e: FormEvent) => {
    e.preventDefault();

    setTouched({ email: true, password: true });
    if (Object.values(errors).some(Boolean)) return;

    setBusy(true);
    setError(null);
    try {
      await login(email.trim(), password);
      notify.success("Welcome back!", "Logged in");
      nav("/app");
    } catch (err) {
      setError(errMessage(err, "Login failed. Check your email and password."));
    } finally {
      setBusy(false);
    }
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

            <Button type="submit" loading={busy} disabled={googleBusy} fullWidth size="md">
              Log in
            </Button>

            <Divider label="or" labelPosition="center" my={2} />

            <GoogleSignInButton
              label="Continue with Google"
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

            <Button
              variant="default"
              fullWidth
              size="md"
              leftSection={<PlayCircle size={17} />}
              loading={demoBusy}
              onClick={enterDemo}
            >
              Explore the live demo
            </Button>

            <Text c="dimmed" size="sm" ta="center">
              No account?{" "}
              <Anchor component={Link} to="/signup" fw={600}>
                Sign up free
              </Anchor>
            </Text>
          </Stack>
        </motion.form>
      </div>
    </div>
  );
}
