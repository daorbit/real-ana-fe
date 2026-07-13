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

export default function Signup() {
  const { signup } = useAuth();
  const nav = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // per-field errors, shown under the input
  const [nameErr, setNameErr] = useState<string | null>(null);
  const [emailErr, setEmailErr] = useState<string | null>(null);
  const [pwErr, setPwErr] = useState<string | null>(null);

  const checkName = v.all(v.required("Name"), v.minLength("Name", 2), v.maxLength("Name", 60));

  const submit = async (e: FormEvent) => {
    e.preventDefault();

    const n = checkName(name);
    const em = v.email(email);
    const pw = v.password(password);
    setNameErr(n); setEmailErr(em); setPwErr(pw);
    if (n || em || pw) return;

    setBusy(true); setError(null);
    try {
      await signup(email.trim(), password, name.trim());
      notify.success("Account created. Let's get you tracking.", "Welcome to Quantalog");
      nav("/app");
    } catch (err) {
      setError(errMessage(err, "Signup failed. That email may already be registered."));
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
              <Title order={2}>Create your account</Title>
              <Text c="dimmed" size="sm" mt={4}>Start tracking in under two minutes.</Text>
            </div>
            {error && <Alert color="red" variant="light">{error}</Alert>}
            <TextInput
              label="Name" placeholder="Jane Doe" size="md" withAsterisk
              value={name} error={nameErr}
              onChange={(e) => { setName(e.currentTarget.value); if (nameErr) setNameErr(null); }}
              onBlur={() => setNameErr(checkName(name))}
            />
            <TextInput
              label="Email" type="email" placeholder="you@company.com" size="md" withAsterisk
              value={email} error={emailErr}
              onChange={(e) => { setEmail(e.currentTarget.value); if (emailErr) setEmailErr(null); }}
              onBlur={() => setEmailErr(v.email(email))}
            />
            <PasswordInput
              label="Password" placeholder="At least 6 characters" size="md" withAsterisk
              value={password} error={pwErr}
              onChange={(e) => { setPassword(e.currentTarget.value); if (pwErr) setPwErr(null); }}
              onBlur={() => setPwErr(v.password(password))}
            />
            <Button type="submit" loading={busy} fullWidth size="md">Create account</Button>
            <Text c="dimmed" size="sm" ta="center">
              Have an account? <Anchor component={Link} to="/login" fw={600}>Log in</Anchor>
            </Text>
          </Stack>
        </motion.form>
      </div>
    </div>
  );
}
