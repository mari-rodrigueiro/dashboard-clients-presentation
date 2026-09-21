import {
  CircleGauge,
  Lightbulb,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  ShieldAlert,
  TrendingUp,
  Users,
} from "lucide-react";
import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";

import { useAuth } from "../../hooks/use-auth";
import { cn } from "../../lib/utils";
import { AiAssistantSheet, AiAssistantTrigger } from "../ai/AiAssistantSheet";
import { Button } from "../ui/button";
import { GlobalSearch } from "./GlobalSearch";

const navItems = [
  { to: "/", label: "Visão Geral", icon: CircleGauge, end: true },
  { to: "/clientes", label: "Clientes", icon: Users, end: false },
  { to: "/evolucao", label: "Evolução", icon: TrendingUp, end: false },
  { to: "/riscos", label: "Riscos", icon: ShieldAlert, end: false },
  { to: "/oportunidades", label: "Oportunidades", icon: Lightbulb, end: false },
];

const navItemsSecundarios = [
  { to: "/configuracoes", label: "Configurações", icon: Settings, end: false },
];

export function AppShell() {
  const { usuario, logout } = useAuth();
  const [aiSheetOpen, setAiSheetOpen] = useState(false);
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

  const iniciais = (usuario?.email ?? "?").slice(0, 2).toUpperCase();

  return (
    <div className="relative flex min-h-screen w-full overflow-hidden bg-background">
      <div className="app-grid pointer-events-none fixed inset-0 opacity-40" />

      <aside
        className={cn(
          "glass-panel relative z-20 flex shrink-0 flex-col border-y-0 border-l-0 transition-[width] duration-200",
          collapsed ? "w-16" : "w-60",
        )}
      >
        <div
          className={cn(
            "flex h-20 items-center gap-3 border-b border-border",
            collapsed ? "justify-center px-2" : "px-5",
          )}
        >
          <div className="grid size-9 shrink-0 place-items-center rounded-md bg-primary text-primary-foreground shadow-sm">
            <span className="font-display text-sm font-bold">CS</span>
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="truncate font-display text-sm font-bold text-foreground">
                Dashboard CS
              </p>
              <p className="truncate text-[10px] font-medium uppercase text-muted-foreground">
                Customer Success
              </p>
            </div>
          )}
        </div>

        <nav className="flex flex-1 flex-col gap-1.5 px-3 py-6" aria-label="Navegação principal">
          {!collapsed && (
            <p className="px-3 pb-2 text-[10px] font-bold uppercase text-muted-foreground">
              Workspace
            </p>
          )}
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              title={collapsed ? label : undefined}
              className={({ isActive }) =>
                cn(
                  "flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary/70 hover:text-foreground",
                  isActive && "bg-secondary text-primary",
                  collapsed && "justify-center px-0",
                )
              }
            >
              <Icon className="size-4 shrink-0" />
              {!collapsed && <span>{label}</span>}
            </NavLink>
          ))}
          <div className={cn("my-2 border-t border-border", collapsed && "mx-1")} />
          {navItemsSecundarios.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              title={collapsed ? label : undefined}
              className={({ isActive }) =>
                cn(
                  "flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary/70 hover:text-foreground",
                  isActive && "bg-secondary text-primary",
                  collapsed && "justify-center px-0",
                )
              }
            >
              <Icon className="size-4 shrink-0" />
              {!collapsed && <span>{label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-border p-3">
          <div
            className={cn(
              "flex items-center gap-3 rounded-md bg-secondary/70 p-3",
              collapsed && "justify-center p-2",
            )}
          >
            <div className="grid size-8 shrink-0 place-items-center rounded-md bg-background text-xs font-bold text-primary">
              {iniciais}
            </div>
            {!collapsed && (
              <p className="truncate text-xs font-semibold text-foreground">{usuario?.email}</p>
            )}
          </div>
          <button
            type="button"
            onClick={toggleCollapsed}
            className={cn(
              "mt-2 flex h-9 w-full items-center gap-3 rounded-md px-3 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary/70 hover:text-foreground",
              collapsed && "justify-center px-0",
            )}
          >
            {collapsed ? (
              <PanelLeftOpen className="size-4 shrink-0" />
            ) : (
              <PanelLeftClose className="size-4 shrink-0" />
            )}
            {!collapsed && <span>Recolher</span>}
          </button>
        </div>
      </aside>

      <div className="relative z-10 min-w-0 flex-1">
        <header className="glass-panel sticky top-0 z-20 flex h-20 items-center gap-4 border-x-0 border-t-0 px-5 lg:px-8">
          <GlobalSearch />
          <div className="ml-auto flex items-center gap-3 text-sm">
            <AiAssistantTrigger onClick={() => setAiSheetOpen(true)} />
            <span className="hidden text-muted-foreground sm:inline">{usuario?.email}</span>
            <Button variant="outline" size="sm" onClick={() => logout()}>
              <LogOut className="size-4" />
              Sair
            </Button>
          </div>
        </header>
        <main className="mx-auto max-w-[1400px] px-5 py-7 lg:px-8 lg:py-9">
          <Outlet />
        </main>
      </div>
      <AiAssistantSheet open={aiSheetOpen} onClose={() => setAiSheetOpen(false)} />
    </div>
  );
}
