import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useDispatch } from "react-redux";
import { api, setToken, clearToken, getToken } from "./api";
import { api as rtkApi } from "./store";
import type { User } from "./types";

type AuthState = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthState | null>(null);

type AuthResp = { token: string; user: User };

export function AuthProvider({ children }: { children: ReactNode }) {
  const dispatch = useDispatch();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

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
    setUser(r.user);
  };

  const logout = () => {
    clearToken();
    setUser(null);
    // Drop every cached response — otherwise the next user to log in on this
    // browser would briefly see the previous user's workspaces and stats.
    dispatch(rtkApi.util.resetApiState());
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth outside provider");
  return ctx;
}
