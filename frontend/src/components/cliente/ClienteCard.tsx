import { ArrowUpRight, CalendarClock, UserRound } from "lucide-react";
import { Link } from "react-router-dom";

import type { Cliente } from "../../lib/types";
import { Badge } from "../ui/badge";
import { HealthBadge, PhaseTag } from "./ClienteBadges";

export function ClienteCard({ cliente }: { cliente: Cliente }) {
  return (
    <Link
      to={`/clientes/${cliente.id}`}
      className="glass-panel group flex min-h-[220px] flex-col rounded-lg p-5 transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg"
    >
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <PhaseTag fase={cliente.fase} />
          <h3 className="mt-3 font-display text-base font-bold group-hover:text-primary">
            {cliente.nome}
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">{cliente.gp.nome}</p>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <HealthBadge health={cliente.health_status} />
          {!cliente.ativo && <Badge tone="neutral">Inativo</Badge>}
        </div>
      </div>
      {cliente.contexto && (
        <p className="line-clamp-3 text-sm leading-6 text-muted-foreground">{cliente.contexto}</p>
      )}
      <div className="mt-auto flex items-end justify-between gap-3 border-t border-border pt-4">
        <div className="space-y-1 text-[11px] text-muted-foreground">
          <p className="flex items-center gap-1.5">
            <UserRound className="size-3" /> {cliente.segmento ?? "Segmento não informado"}
          </p>
          <p className="flex items-center gap-1.5">
            <CalendarClock className="size-3" /> Desde{" "}
            {new Date(cliente.data_entrada).toLocaleDateString("pt-BR")}
          </p>
        </div>
        <div className="grid size-8 shrink-0 place-items-center rounded-md bg-secondary text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
          <ArrowUpRight className="size-4" />
        </div>
      </div>
    </Link>
  );
}
