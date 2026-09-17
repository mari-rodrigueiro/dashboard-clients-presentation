import { Link, useParams } from "react-router-dom";

import { Badge } from "../../components/ui/badge";
import { useAcoes } from "../../hooks/use-acoes";
import { useCliente } from "../../hooks/use-clientes";
import { useEvolucoes } from "../../hooks/use-evolucoes";
import { useOportunidades } from "../../hooks/use-oportunidades";
import { usePlanoSucesso } from "../../hooks/use-plano-sucesso";
import { useRiscos } from "../../hooks/use-riscos";

function Secao({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3 border-b border-border py-8 last:border-0">
      <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {titulo}
      </h2>
      <div className="flex flex-col gap-3 text-base leading-relaxed">{children}</div>
    </section>
  );
}

export function CaseViewPage() {
  const { id } = useParams<{ id: string }>();
  const clienteId = id ?? "";

  const { data: cliente, isLoading: loadingCliente } = useCliente(clienteId);
  const { data: plano } = usePlanoSucesso(clienteId);
  const { data: evolucoes } = useEvolucoes(clienteId);
  const { data: riscos } = useRiscos(clienteId);
  const { data: oportunidades } = useOportunidades(clienteId);
  const { data: acoes } = useAcoes(clienteId);

  if (loadingCliente || !cliente) {
    return <p className="text-sm text-muted-foreground">Carregando...</p>;
  }

  const ultimaEvolucaoComResultado = evolucoes?.find((e) => e.resultado);

  return (
    <div className="mx-auto flex max-w-3xl flex-col">
      <div className="flex items-center justify-between pb-6">
        <Link to={`/clientes/${cliente.id}`} className="text-sm text-muted-foreground hover:underline">
          ← Voltar à visão do cliente
        </Link>
        <Badge tone="neutral">{cliente.fase}</Badge>
      </div>

      <h1 className="text-4xl font-semibold">{cliente.nome}</h1>
      <p className="mt-1 text-muted-foreground">GP: {cliente.gp.nome}</p>

      <Secao titulo="Desafio">
        <p>{cliente.contexto || plano?.situacao_inicial || "Sem contexto registrado ainda."}</p>
        {plano?.desafios && <p>{plano.desafios}</p>}
      </Secao>

      <Secao titulo="Estratégia">
        {plano ? (
          <>
            <p>
              <span className="font-medium">O que é sucesso: </span>
              {plano.expectativa_sucesso}
            </p>
            <p>
              <span className="font-medium">Curto prazo: </span>
              {plano.expectativa_curto_prazo}
            </p>
            <p>
              <span className="font-medium">Médio prazo: </span>
              {plano.expectativa_medio_prazo}
            </p>
            <p>
              <span className="font-medium">Longo prazo: </span>
              {plano.expectativa_longo_prazo}
            </p>
          </>
        ) : (
          <p className="text-muted-foreground">Nenhum plano de sucesso registrado ainda.</p>
        )}
      </Secao>

      <Secao titulo="Ações">
        {acoes && acoes.length > 0 ? (
          <ul className="flex flex-col gap-2">
            {acoes.map((acao) => (
              <li key={acao.id}>
                {acao.descricao} <Badge tone="neutral">{acao.status}</Badge>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground">Nenhuma ação registrada ainda.</p>
        )}
      </Secao>

      <Secao titulo="Evolução">
        {evolucoes && evolucoes.length > 0 ? (
          <ol className="flex flex-col gap-4">
            {evolucoes.map((e) => (
              <li key={e.id}>
                <p className="text-sm text-muted-foreground">{e.data_referencia}</p>
                <p className="font-medium">{e.titulo}</p>
                <p>{e.situacao}</p>
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-muted-foreground">Nenhum registro de evolução ainda.</p>
        )}
      </Secao>

      <Secao titulo="Resultado">
        {ultimaEvolucaoComResultado ? (
          <p>{ultimaEvolucaoComResultado.resultado}</p>
        ) : (
          <p className="text-muted-foreground">Nenhum resultado registrado ainda.</p>
        )}
      </Secao>

      <Secao titulo="Aprendizado">
        {plano?.resumo_riscos && (
          <p>
            <span className="font-medium">Riscos: </span>
            {plano.resumo_riscos}
          </p>
        )}
        {plano?.resumo_oportunidades && (
          <p>
            <span className="font-medium">Oportunidades: </span>
            {plano.resumo_oportunidades}
          </p>
        )}
        {!plano?.resumo_riscos && !plano?.resumo_oportunidades && (
          <p className="text-muted-foreground">
            {(riscos?.length ?? 0) + (oportunidades?.length ?? 0) > 0
              ? "Riscos e oportunidades registrados, mas sem resumo de aprendizado ainda no plano de sucesso."
              : "Nenhum aprendizado registrado ainda."}
          </p>
        )}
      </Secao>
    </div>
  );
}
