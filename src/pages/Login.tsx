import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  TextInput, PasswordInput, Button, Title, Text, Alert, Stack, Anchor,
} from "@mantine/core";
import { useAuth } from "../auth";
import { AuthBrand } from "../components/AuthBrand";

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true); setError(null);
    try {
      await login(email, password);
      nav("/app");
    } catch (err) {
      setError(err instanceof Error ? err.message : "login failed");
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
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Stack gap="lg">
            <div>
              <Title order={2}>Welcome back</Title>
              <Text c="dimmed" size="sm" mt={4}>Log in to your Vantage dashboard.</Text>
            </div>
            {error && <Alert color="red" variant="light">{error}</Alert>}
            <TextInput label="Email" type="email" placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.currentTarget.value)} required size="md" />
            <PasswordInput label="Password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.currentTarget.value)} required size="md" />
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
