import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth";
import { AuthSide } from "../components/AuthSide";

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
    setBusy(true);
    setError(null);
    try {
      await signup(email, password, name);
      nav("/");
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
          <h1>Create your account</h1>
          <p className="muted">Start tracking in under two minutes.</p>
          {error && <p className="error-box">{error}</p>}
          <label>Name
            <input placeholder="Jane Doe" value={name} onChange={(e) => setName(e.target.value)} required />
          </label>
          <label>Email
            <input type="email" placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </label>
          <label>Password
            <input type="password" placeholder="At least 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
          </label>
          <button type="submit" className="btn-primary lg full" disabled={busy}>{busy ? "Creating…" : "Create account"}</button>
          <p className="muted center-t">Have an account? <Link to="/login">Log in</Link></p>
        </form>
      </div>
    </div>
  );
}
