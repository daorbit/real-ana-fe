import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  TextInput, PasswordInput, Button, Title, Text, Alert, Stack, Anchor,
} from "@mantine/core";
import { useAuth } from "../auth";
import { AuthSide } from "../components/Brand";

export default function Signup() {
  const { signup } = useAuth();
  const nav = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true); setError(null);
    try {
      await signup(email, password, name);
      nav("/app");
    } catch (err) {
      setError(err instanceof Error ? err.message : "signup failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-split">
      <AuthSide />
      <div className="auth-panel">
        <form className="auth-form" onSubmit={submit}>
          <Stack gap="md">
            <div>
              <Title order={2}>Create your account</Title>
              <Text c="dimmed" size="sm">Start tracking in under two minutes.</Text>
            </div>
            {error && <Alert color="red" variant="light">{error}</Alert>}
            <TextInput label="Name" placeholder="Jane Doe" value={name} onChange={(e) => setName(e.currentTarget.value)} required />
            <TextInput label="Email" type="email" placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.currentTarget.value)} required />
            <PasswordInput label="Password" placeholder="At least 6 characters" value={password} onChange={(e) => setPassword(e.currentTarget.value)} required minLength={6} />
            <Button type="submit" loading={busy} fullWidth size="md">Create account</Button>
            <Text c="dimmed" size="sm" ta="center">
              Have an account? <Anchor component={Link} to="/login">Log in</Anchor>
            </Text>
          </Stack>
        </form>
      </div>
    </div>
  );
}
