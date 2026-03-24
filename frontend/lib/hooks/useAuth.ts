"use client";

import { useEffect, useState } from "react";

type AuthState = { authenticated: boolean; role?: string } | null;

export function useAuth(): AuthState {
  const [auth, setAuth] = useState<AuthState>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then(setAuth)
      .catch(() => setAuth({ authenticated: false }));
  }, []);

  return auth;
}
