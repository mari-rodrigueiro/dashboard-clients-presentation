import { Lightbulb } from "lucide-react";
import { Link } from "react-router-dom";

import { EmptyState, PhaseTag } from "../../components/cliente/ClienteBadges";
import { PageIntro } from "../../components/layout/PageHeader";
import { Badge } from "../../components/ui/badge";
import { useOportunidadesCarteira } from "../../hooks/use-oportunidades";
import type { Potencial } from "../../lib/types";

const potencialLabel: Record<Potencial, string> = {
  baixo: "Baixo",
  medio: "Médio",
  alto: "Alto",
};

const potencialTone: Record<Potencial, "neutral" | "warning" | "success"> = {
  baixo: "neutral",
  medio: "warning",
  alto: "success",
};

export function OportunidadesPage() {
  const { data: oportunidades, isLoading } = useOportunidadesCarteira();

  return (
    <div className="flex flex-col gap-6">
      <PageIntro
        eyebrow="Oportunidades"
        title="Próximos espaços de valor"
        description="Oportunidades ativas identificadas a partir do momento atual de cada conta."
      />

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Carregando...</p>
      ) : oportunidades && oportunidades.length > 0 ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {oportunidades.map((oportunidade) => (
            <Link
              key={oportunidade.id}
              to={`/clientes/${oportunidade.cliente_id}`}
              className="glass-panel group rounded-lg p-6 transition-all hover:-translate-y-1 hover:border-success/30"
            >
              <div className="flex items-start justify-between">
                <div className="grid size-9 place-items-center rounded-md bg-success-bg text-success">
                  <Lightbulb className="size-4" />
                </div>
                <PhaseTag fase={oportunidade.cliente_fase} />
              </div>
              <p className="mt-5 text-xs font-medium text-muted-foreground">
                {oportunidade.cliente_nome}
              </p>
              <h2 className="mt-1 font-display text-lg font-bold group-hover:text-primary">
                {oportunidade.descricao}
              </h2>
              <div className="mt-5 flex items-center gap-3 border-t border-border pt-4">
                <Badge tone={potencialTone[oportunidade.potencial]}>
                  Potencial {potencialLabel[oportunidade.potencial]}
                </Badge>
                {oportunidade.categoria && (
                  <span className="text-xs text-muted-foreground">{oportunidade.categoria}</span>
                )}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState
          title="Nenhuma oportunidade ativa"
          description="Não há oportunidades ativas registradas na carteira no momento."
        />
      )}
    </div>
  );
}
