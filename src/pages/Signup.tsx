import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  TextInput, PasswordInput, Button, Title, Text, Alert, Stack, Anchor, Group,
} from "@mantine/core";
import { useAuth } from "../auth";
import { AuthBrand } from "../components/AuthBrand";
import { PasswordStrength } from "../components/PasswordStrength";
import { notify, errMessage } from "../notify";
import * as v from "../utils/validate";

type Touched = Record<string, boolean>;

export default function Signup() {
  const { signup } = useAuth();
  const nav = useNavigate();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

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
      await signup(email.trim(), password, name);
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
              <Text c="dimmed" size="sm" mt={4}>
                Start tracking in under two minutes.
              </Text>
            </div>

            {error && (
              <Alert color="red" variant="light">
                {error}
              </Alert>
            )}

            <Group grow align="flex-start" gap="sm">
              <TextInput
                label="First name"
                placeholder="Jane"
                size="md"
                withAsterisk
                autoComplete="given-name"
                value={firstName}
                error={show("firstName")}
                onChange={(e) => setFirstName(e.currentTarget.value)}
                onBlur={blur("firstName")}
              />
              <TextInput
                label="Last name"
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
                placeholder="At least 8 characters"
                size="md"
                withAsterisk
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
              withAsterisk
              autoComplete="new-password"
              value={confirm}
              error={show("confirm")}
              onChange={(e) => setConfirm(e.currentTarget.value)}
              onBlur={blur("confirm")}
            />

            <Button type="submit" loading={busy} fullWidth size="md">
              Create account
            </Button>

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
