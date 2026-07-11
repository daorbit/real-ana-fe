import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth";
import { AuthSide } from "../components/AuthSide";

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await login(email, password);
      nav("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "login failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-split">
      <AuthSide />
      <div className="auth-panel">
        <form className="auth-form" onSubmit={submit}>
          <h1>Welcome back</h1>
          <p className="muted">Log in to your Pulse dashboard.</p>
          {error && <p className="error-box">{error}</p>}
          <label>Email
            <input type="email" placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </label>
          <label>Password
            <input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </label>
          <button type="submit" className="btn-primary lg full" disabled={busy}>{busy ? "Logging in…" : "Log in"}</button>
          <p className="muted center-t">No account? <Link to="/signup">Sign up free</Link></p>
        </form>
      </div>
    </div>
  );
}
