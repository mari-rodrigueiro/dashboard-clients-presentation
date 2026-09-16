import { createContext, type ReactNode, useContext, useEffect, useState } from "react";

import { apiClient } from "../lib/api-client";
import type { Usuario } from "../lib/types";

interface AuthContextValue {
  usuario: Usuario | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    apiClient
      .get<Usuario>("/auth/me")
      .then((me) => {
        if (!cancelled) setUsuario(me);
      })
      .catch(() => {
        if (!cancelled) setUsuario(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function login(email: string, password: string) {
    const me = await apiClient.post<Usuario>("/auth/login", { email, password });
    setUsuario(me);
  }

  async function logout() {
    await apiClient.post("/auth/logout");
    setUsuario(null);
  }

  async function changePassword(currentPassword: string, newPassword: string) {
    await apiClient.put("/auth/password", {
      current_password: currentPassword,
      new_password: newPassword,
    });
  }

  return (
    <AuthContext.Provider value={{ usuario, loading, login, logout, changePassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de AuthProvider");
  return ctx;
}
