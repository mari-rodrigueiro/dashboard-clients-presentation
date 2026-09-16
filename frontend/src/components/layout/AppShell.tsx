import { NavLink, Outlet } from "react-router-dom";

import { useAuth } from "../../hooks/use-auth";
import { Button } from "../ui/button";

export function AppShell() {
  const { usuario, logout } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-6">
            <span className="text-base font-semibold">Dashboard CS</span>
            <nav className="flex gap-4 text-sm text-muted-foreground">
              <NavLink
                to="/clientes"
                className={({ isActive }) => (isActive ? "text-foreground" : "")}
              >
                Clientes
              </NavLink>
              <NavLink
                to="/configuracoes"
                className={({ isActive }) => (isActive ? "text-foreground" : "")}
              >
                Configurações
              </NavLink>
            </nav>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-muted-foreground">{usuario?.email}</span>
            <Button variant="outline" onClick={() => logout()}>
              Sair
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}
