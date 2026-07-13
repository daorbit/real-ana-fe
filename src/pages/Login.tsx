import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  TextInput, PasswordInput, Button, Title, Text, Alert, Stack, Anchor,
} from "@mantine/core";
import { useAuth } from "../auth";
import { AuthBrand } from "../components/AuthBrand";
import { notify, errMessage } from "../notify";
import * as v from "../utils/validate";

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [emailErr, setEmailErr] = useState<string | null>(null);
  const [pwErr, setPwErr] = useState<string | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();

    const em = v.email(email);
    // On login we only require a password to be present — length rules are the
    // signup form's job, and rejecting an old short password would be wrong.
    const pw = password ? null : "Password is required";
    setEmailErr(em); setPwErr(pw);
    if (em || pw) return;

    setBusy(true); setError(null);
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
              <Text c="dimmed" size="sm" mt={4}>Log in to your Quantalog dashboard.</Text>
            </div>
            {error && <Alert color="red" variant="light">{error}</Alert>}
            <TextInput
              label="Email" type="email" placeholder="you@company.com" size="md" withAsterisk
              value={email} error={emailErr}
              onChange={(e) => { setEmail(e.currentTarget.value); if (emailErr) setEmailErr(null); }}
              onBlur={() => setEmailErr(v.email(email))}
            />
            <PasswordInput
              label="Password" placeholder="••••••••" size="md" withAsterisk
              value={password} error={pwErr}
              onChange={(e) => { setPassword(e.currentTarget.value); if (pwErr) setPwErr(null); }}
            />
            <Button type="submit" loading={busy} fullWidth size="md">Log in</Button>
            <Text c="dimmed" size="sm" ta="center">
              No account? <Anchor component={Link} to="/signup" fw={600}>Sign up free</Anchor>
            </Text>
          </Stack>
        </motion.form>
      </div>
    </div>
  );
}
