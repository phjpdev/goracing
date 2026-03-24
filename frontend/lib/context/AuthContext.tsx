"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

type AuthState = {
  authenticated: boolean;
  role?: string;
  vip_expiry_date?: string | null;
} | null;

type AuthContextValue = {
  auth: AuthState;
  refreshAuth: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue>({
  auth: null,
  refreshAuth: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [auth, setAuth] = useState<AuthState>(null);

  const refreshAuth = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      setAuth(data);
    } catch {
      setAuth({ authenticated: false });
    }
  }, []);

  useEffect(() => {
    refreshAuth();
  }, [refreshAuth]);

  return (
    <AuthContext.Provider value={{ auth, refreshAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
