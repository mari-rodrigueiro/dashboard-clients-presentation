import { Link } from "react-router-dom";

import { faseLabel, HealthBadge } from "../../components/cliente/ClienteBadges";
import { PageIntro } from "../../components/layout/PageHeader";
import { useClientes } from "../../hooks/use-clientes";
import type { FaseCliente } from "../../lib/types";

const fases: FaseCliente[] = [
  "onboarding",
  "adocao",
  "retencao",
  "expansao",
  "recuperacao",
  "encerrado",
];

export function EvolucaoPage() {
  const { data: clientes, isLoading } = useClientes({ ativo: true });

  return (
    <div className="flex flex-col gap-6">
      <PageIntro
        eyebrow="Evolução"
        title="Onde cada cliente está agora"
        description="A carteira organizada por fase, com o contexto necessário para sustentar a próxima evolução."
      />

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Carregando...</p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {fases.map((fase, index) => {
            const clientesDaFase = (clientes ?? []).filter((cliente) => cliente.fase === fase);
            if (clientesDaFase.length === 0) return null;
            return (
              <section key={fase}>
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-primary">0{index + 1}</p>
                    <h2 className="mt-1 font-display text-base font-bold">{faseLabel[fase]}</h2>
                  </div>
                  <span className="grid size-8 place-items-center rounded-md bg-secondary text-xs font-bold text-secondary-foreground">
                    {clientesDaFase.length}
                  </span>
                </div>
                <div className="flex flex-col gap-3">
                  {clientesDaFase.map((cliente) => (
                    <Link
                      key={cliente.id}
                      to={`/clientes/${cliente.id}`}
                      className="glass-panel block rounded-lg p-5 transition-colors hover:border-primary/35"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-display text-sm font-bold">{cliente.nome}</h3>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {cliente.segmento ?? cliente.gp.nome}
                          </p>
                        </div>
                        <HealthBadge health={cliente.health_status} />
                      </div>
                      {cliente.contexto && (
                        <p className="mt-4 line-clamp-3 text-sm leading-6 text-muted-foreground">
                          {cliente.contexto}
                        </p>
                      )}
                    </Link>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
