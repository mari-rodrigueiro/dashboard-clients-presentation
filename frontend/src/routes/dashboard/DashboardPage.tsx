import { ArrowRight, Sparkles, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";

import { ClienteCard } from "../../components/cliente/ClienteCard";
import { ResumoCarteiraCard } from "../../components/dashboard/ResumoCarteiraCard";
import { PageIntro, SectionHeading } from "../../components/layout/PageHeader";
import { useClientes } from "../../hooks/use-clientes";
import { useDashboard } from "../../hooks/use-dashboard";
import type { HealthStatus } from "../../lib/types";

export function DashboardPage() {
  const { data: stats, isLoading } = useDashboard();
  const { data: clientes } = useClientes({ ativo: true });

  if (isLoading || !stats) {
    return <p className="text-sm text-muted-foreground">Carregando...</p>;
  }

  const contasEmFoco = (clientes ?? []).filter((c) => c.health_status !== "saudavel").slice(0, 3);

  // Leitura da carteira pela saúde (health_status), não pela existência de riscos:
  // todo cliente tem riscos registrados, mas isso não torna a conta crítica.
  const totalPorSaude = (status: HealthStatus) =>
    stats.clientes_por_saude.find((c) => c.health_status === status)?.total ?? 0;
  const criticos = totalPorSaude("critico");
  const emAtencao = totalPorSaude("atencao");
  const sinaisSaude = [
    criticos > 0 ? `${criticos} em estado crítico` : null,
    emAtencao > 0 ? `${emAtencao} em atenção` : null,
  ].filter(Boolean);
  const resumo =
    stats.total_clientes === 0
      ? "Você ainda não acompanha clientes ativos."
      : `Você acompanha ${stats.total_clientes} ${stats.total_clientes === 1 ? "cliente ativo" : "clientes ativos"}, ${
          sinaisSaude.length > 0
            ? sinaisSaude.join(" e ")
            : stats.total_clientes === 1
              ? "saudável"
              : "todos saudáveis"
        }.`;

  return (
    <div className="flex flex-col gap-9">
      <PageIntro
        eyebrow="Visão Geral"
        title="A evolução da carteira, em contexto"
        description="Uma leitura executiva dos movimentos, sinais e próximos passos mais relevantes para cada relacionamento."
      />

      <section className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        {/* Rótulo no topo (alinhado ao título do Resumo da Carteira, mesmo padding p-6),
            botão no rodapé e frase no meio, conforme a altura que o card ao lado definir. */}
        <div className="relative flex flex-col justify-between gap-5 overflow-hidden rounded-lg bg-primary p-6 text-primary-foreground shadow-lg">
          <p className="flex items-center gap-2 text-xs font-bold uppercase text-primary-foreground/70">
            <Sparkles className="size-4" /> Leitura da carteira
          </p>
          <h2 className="max-w-2xl font-display text-2xl font-semibold leading-tight">{resumo}</h2>
          <Link
            to="/riscos"
            className="inline-flex h-10 w-fit items-center gap-2 rounded-md bg-secondary px-4 text-sm font-medium text-secondary-foreground transition-colors hover:bg-secondary/70"
          >
            Revisar sinais prioritários <ArrowRight className="size-4" />
          </Link>
        </div>
        <ResumoCarteiraCard clientes={clientes ?? []} />
      </section>

      <section>
        <div className="mb-5 flex items-center justify-between">
          <SectionHeading
            title="Contas em foco"
            description="Prioridades sugeridas para esta semana"
          />
          <Link
            to="/clientes"
            className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            Ver todos <ArrowRight className="size-4" />
          </Link>
        </div>
        {contasEmFoco.length > 0 ? (
          <div className="grid gap-4 lg:grid-cols-3">
            {contasEmFoco.map((cliente) => (
              <ClienteCard key={cliente.id} cliente={cliente} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Nenhuma conta fora do estado saudável no momento.
          </p>
        )}
      </section>

      <section>
        <SectionHeading
          icon={TrendingUp}
          title="Movimentos recentes"
          description="Últimas evoluções registradas"
        />
        {stats.ultimas_evolucoes.length > 0 ? (
          <div className="grid gap-4 lg:grid-cols-3">
            {stats.ultimas_evolucoes.slice(0, 3).map((e) => (
              <div key={e.id} className="glass-panel rounded-lg p-5">
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-xs font-semibold">{e.cliente_nome}</p>
                  <span className="rounded-sm bg-secondary px-2 py-1 text-[10px] font-bold text-primary">
                    Evolução
                  </span>
                </div>
                <p className="text-sm leading-6 text-muted-foreground">{e.titulo}</p>
                <Link
                  to={`/clientes/${e.cliente_id}`}
                  className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                >
                  Ver cliente <ArrowRight className="size-3" />
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Nenhuma evolução registrada ainda.</p>
        )}
      </section>
    </div>
  );
}
