import { Users } from "lucide-react";
import { Fragment } from "react";
import { Link } from "react-router-dom";

import type { Cliente, HealthStatus } from "../../lib/types";
import { cn } from "../../lib/utils";
import { SectionHeading } from "../layout/PageHeader";

// Grupos pela saúde registrada do cliente — mesma regra do card "Leitura da carteira".
const grupos: { status: HealthStatus; label: string; dot: string }[] = [
  { status: "saudavel", label: "Avanço consistente", dot: "bg-success" },
  { status: "atencao", label: "Atenção preventiva", dot: "bg-warning" },
  { status: "critico", label: "Ação imediata", dot: "bg-danger" },
];

interface ResumoCarteiraCardProps {
  /** Clientes ativos (a página já os carrega para "Contas em foco"). */
  clientes: Cliente[];
}

export function ResumoCarteiraCard({ clientes }: ResumoCarteiraCardProps) {
  const gruposComClientes = grupos
    .map((grupo) => ({
      ...grupo,
      clientes: clientes
        .filter((c) => c.health_status === grupo.status)
        .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR")),
    }))
    // Grupo sem clientes fica escondido.
    .filter((grupo) => grupo.clientes.length > 0);

  return (
    <div className="glass-panel rounded-lg p-6">
      <SectionHeading
        icon={Users}
        title="Resumo da Carteira"
        description="Clientes ativos por saúde"
      />
      {gruposComClientes.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nenhum cliente ativo no momento.</p>
      ) : (
        <ul className="space-y-4">
          {gruposComClientes.map((grupo) => (
            <li key={grupo.status} className="flex gap-3">
              <span className={cn("mt-1.5 size-2 shrink-0 rounded-full", grupo.dot)} />
              <div className="min-w-0">
                <p className="text-sm font-semibold">{grupo.label}</p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  {grupo.clientes.map((c, i) => (
                    <Fragment key={c.id}>
                      {i > 0 && " · "}
                      <Link to={`/clientes/${c.id}`} className="text-primary hover:underline">
                        {c.nome}
                      </Link>
                    </Fragment>
                  ))}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
