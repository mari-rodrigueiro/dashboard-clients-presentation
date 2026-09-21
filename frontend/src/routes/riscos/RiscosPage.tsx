import { ArrowRight, CircleAlert } from "lucide-react";
import { Link } from "react-router-dom";

import { EmptyState, HealthBadge } from "../../components/cliente/ClienteBadges";
import { PageIntro } from "../../components/layout/PageHeader";
import { Badge } from "../../components/ui/badge";
import { useRiscosCarteira } from "../../hooks/use-riscos";
import type { Severidade } from "../../lib/types";

const severidadeLabel: Record<Severidade, string> = {
  baixa: "Baixa",
  media: "Média",
  alta: "Alta",
  critica: "Crítica",
};

const severidadeTone: Record<Severidade, "neutral" | "warning" | "danger"> = {
  baixa: "neutral",
  media: "warning",
  alta: "warning",
  critica: "danger",
};

export function RiscosPage() {
  const { data: riscos, isLoading } = useRiscosCarteira();

  return (
    <div className="flex flex-col gap-6">
      <PageIntro
        eyebrow="Riscos"
        title="Sinais que pedem atenção"
        description="Riscos em aberto de toda a carteira, ordenados por severidade, sem perder o contexto de cada cliente."
      />

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Carregando...</p>
      ) : riscos && riscos.length > 0 ? (
        <div className="flex flex-col gap-3">
          {riscos.map((risco) => (
            <Link
              key={risco.id}
              to={`/clientes/${risco.cliente_id}`}
              className="glass-panel grid items-center gap-5 rounded-lg p-5 transition-colors hover:border-danger/30 lg:grid-cols-[1fr_1.8fr_auto]"
            >
              <div>
                <p className="text-[10px] font-bold uppercase text-muted-foreground">Cliente</p>
                <h2 className="mt-1 font-display text-sm font-bold">{risco.cliente_nome}</h2>
                <div className="mt-2">
                  <HealthBadge health={risco.cliente_health_status} />
                </div>
              </div>
              <div>
                <p className="flex items-center gap-2 text-sm font-semibold">
                  <CircleAlert className="size-4 text-danger" />
                  {risco.descricao}
                </p>
                {risco.categoria && (
                  <p className="mt-2 text-xs leading-5 text-muted-foreground">{risco.categoria}</p>
                )}
              </div>
              <div className="flex items-center gap-3">
                <Badge tone={severidadeTone[risco.severidade]}>
                  {severidadeLabel[risco.severidade]}
                </Badge>
                <ArrowRight className="size-4 text-muted-foreground" />
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState
          title="Nenhum risco em aberto"
          description="Não há riscos em aberto registrados na carteira no momento."
        />
      )}
    </div>
  );
}
