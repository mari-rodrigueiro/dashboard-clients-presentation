import { LayoutDashboard, LogOut, PanelLeftClose, PanelLeftOpen, Settings, Users } from "lucide-react";
import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";

import { useAuth } from "../../hooks/use-auth";
import { cn } from "../../lib/utils";
import { Button } from "../ui/button";
import { GlobalSearch } from "./GlobalSearch";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/clientes", label: "Clientes", icon: Users, end: false },
  { to: "/configuracoes", label: "Configurações", icon: Settings, end: false },
];

export function AppShell() {
  const { usuario, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem("sidebar-collapsed") === "1";
    } catch {
      return false;
    }
  });

  function toggleCollapsed() {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("sidebar-collapsed", next ? "1" : "0");
      } catch {
        // localStorage indisponível — apenas ignora, é só uma conveniência de UI
      }
      return next;
    });
  }

  return (
    <div className="flex min-h-screen">
      <aside
        className={cn(
          "glass sticky top-0 flex h-screen flex-col border-r-0 bg-primary/95 text-primary-foreground transition-all duration-200",
          collapsed ? "w-16" : "w-60"
        )}
        style={{ backgroundColor: "hsl(var(--primary) / 0.97)" }}
      >
        <div className="flex items-center gap-2 px-4 py-5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent text-sm font-bold text-accent-foreground">
            CS
          </div>
          {!collapsed && <span className="truncate text-sm font-semibold">Dashboard CS</span>}
        </div>

        <nav className="flex flex-1 flex-col gap-1 px-2">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm text-primary-foreground/70 transition-colors hover:bg-white/10 hover:text-primary-foreground",
                  isActive && "bg-white/15 text-primary-foreground"
                )
              }
              title={collapsed ? label : undefined}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span>{label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="flex flex-col gap-2 px-2 pb-4">
          <button
            type="button"
            onClick={toggleCollapsed}
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-primary-foreground/70 hover:bg-white/10 hover:text-primary-foreground"
          >
            {collapsed ? (
              <PanelLeftOpen className="h-4 w-4 shrink-0" />
            ) : (
              <PanelLeftClose className="h-4 w-4 shrink-0" />
            )}
            {!collapsed && <span>Recolher</span>}
          </button>
        </div>
      </aside>

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="glass sticky top-0 z-10 flex items-center justify-between gap-4 rounded-none border-x-0 border-t-0 px-6 py-3">
          <GlobalSearch />
          <div className="flex items-center gap-4 text-sm">
            <span className="hidden text-muted-foreground sm:inline">{usuario?.email}</span>
            <Button variant="outline" onClick={() => logout()}>
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </Button>
          </div>
        </header>
        <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
