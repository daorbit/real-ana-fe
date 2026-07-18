import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useDispatch } from "react-redux";
import {
  api, setToken, clearToken, getToken,
  startImpersonating, stopImpersonating,
} from "./api";
import { api as rtkApi } from "./store";
import { setDatePrefs } from "./utils";
import type { ProfileUpdate, User } from "./types";

type AuthState = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  /** Save profile fields and fold the result back into the session. */
  updateProfile: (patch: ProfileUpdate) => Promise<void>;
  /** Admin only: act as another user until `exitImpersonation`. */
  impersonate: (userId: string) => Promise<void>;
  exitImpersonation: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

type AuthResp = { token: string; user: User };

export function AuthProvider({ children }: { children: ReactNode }) {
  const dispatch = useDispatch();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Every date helper reads these, so they have to be in place before the app
  // renders anything dated — and re-applied when the user edits them.
  useEffect(() => {
    setDatePrefs({ locale: user?.dateLocale, timeZone: user?.timezone });
  }, [user?.dateLocale, user?.timezone]);

  // On mount, restore session if token present
  useEffect(() => {
    if (!getToken()) {
      setLoading(false);
      return;
    }
    api
      .get<User>("/api/auth/me")
      .then(setUser)
      .catch(() => clearToken())
      .finally(() => setLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    const r = await api.post<AuthResp>("/api/auth/login", { email, password });
    setToken(r.token);
    // Start from a clean cache so nothing from a previous session leaks through.
    dispatch(rtkApi.util.resetApiState());
    setUser(r.user);
  };

  const signup = async (email: string, password: string, name: string) => {
    const r = await api.post<AuthResp>("/api/auth/signup", { email, password, name });
    setToken(r.token);
    dispatch(rtkApi.util.resetApiState());
    // A previous account may have skipped setup on this browser; the flag is
    // per-browser, so a new account has to start with a clean slate.
    localStorage.removeItem("quantalog_onboarding_skipped");
    localStorage.removeItem("quantalog_onboarding_dismissed");
    setUser(r.user);
  };

  const updateProfile = async (patch: ProfileUpdate) => {
    const updated = await api.patch<User>("/api/auth/me", patch);
    // /api/auth/me does not echo `impersonating` on PATCH, and losing it would
    // drop the "you are viewing as …" banner mid-session.
    setUser((prev) => ({ ...updated, impersonating: prev?.impersonating }));
  };

  const logout = () => {
    clearToken();
    setUser(null);
    // Drop every cached response — otherwise the next user to log in on this
    // browser would briefly see the previous user's workspaces and stats.
    dispatch(rtkApi.util.resetApiState());
  };

  const impersonate = async (userId: string) => {
    const r = await api.post<AuthResp>(`/api/admin/impersonate/${userId}`, {});
    startImpersonating(r.token);
    // The cache is full of the admin's own workspaces and stats. Clearing it is
    // what makes the switch complete rather than cosmetic.
    dispatch(rtkApi.util.resetApiState());
    setUser({ ...r.user, impersonating: true });
    // The active workspace is remembered per browser, and it belongs to the
    // admin — leaving it would point every query at a workspace this user
    // cannot see.
    localStorage.removeItem("rta_active_ws");
  };

  const exitImpersonation = async () => {
    if (!stopImpersonating()) return;
    dispatch(rtkApi.util.resetApiState());
    localStorage.removeItem("rta_active_ws");
    const me = await api.get<User>("/api/auth/me");
    setUser(me);
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, signup, logout, updateProfile, impersonate, exitImpersonation }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth outside provider");
  return ctx;
}
