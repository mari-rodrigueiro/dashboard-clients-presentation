import re
import uuid
from dataclasses import dataclass
from datetime import date

from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.acao import Acao
from app.models.cliente import Cliente
from app.models.evolucao import Evolucao
from app.models.oportunidade import Oportunidade
from app.models.plano_sucesso import PlanoSucesso, StatusPlano
from app.models.risco import Risco

# Orçamento de contexto (SPECS.md §11.2): ~6.000 tokens, aproximados por caracteres
# (~4 caracteres/token — suficiente para não precisar de um tokenizer real nesta fase).
TOKEN_BUDGET_CHARS = 6000 * 4
EVOLUCOES_RECENTES_FALLBACK = 15
STOPWORDS = {
    "que",
    "qual",
    "quais",
    "como",
    "para",
    "sobre",
    "com",
    "uma",
    "dos",
    "das",
    "por",
    "cliente",
    "está",
    "esta",
    "são",
}


@dataclass
class ContextItem:
    source_type: str
    source_id: uuid.UUID
    titulo: str
    data: date | None
    texto: str


def _item_len(item: ContextItem) -> int:
    return len(item.texto)


async def _cliente_items(session: AsyncSession, cliente: Cliente) -> list[ContextItem]:
    items = [
        ContextItem(
            source_type="cliente",
            source_id=cliente.id,
            titulo=cliente.nome,
            data=cliente.data_entrada,
            texto=(
                f"Cliente {cliente.nome} — fase: {cliente.fase.value}, "
                f"saúde: {cliente.health_status.value}. "
                f"Contexto: {cliente.contexto or 'não informado'}."
            ),
        )
    ]

    plano_result = await session.execute(
        select(PlanoSucesso).where(
            PlanoSucesso.cliente_id == cliente.id, PlanoSucesso.status == StatusPlano.ATIVO
        )
    )
    plano = plano_result.scalar_one_or_none()
    if plano is not None:
        items.append(
            ContextItem(
                source_type="plano_sucesso",
                source_id=plano.id,
                titulo="Plano de Sucesso",
                data=None,
                texto=(
                    f"Situação inicial: {plano.situacao_inicial}. "
                    f"Sucesso esperado: {plano.expectativa_sucesso}. "
                    f"Curto prazo: {plano.expectativa_curto_prazo}. "
                    f"Médio prazo: {plano.expectativa_medio_prazo}. "
                    f"Longo prazo: {plano.expectativa_longo_prazo}."
                    + (f" Desafios: {plano.desafios}." if plano.desafios else "")
                ),
            )
        )

    riscos_result = await session.execute(select(Risco).where(Risco.cliente_id == cliente.id))
    for risco in riscos_result.scalars().all():
        items.append(
            ContextItem(
                source_type="risco",
                source_id=risco.id,
                titulo=f"Risco ({risco.status.value})",
                data=None,
                texto=(
                    f"{risco.descricao} — severidade {risco.severidade.value}, "
                    f"status {risco.status.value}."
                ),
            )
        )

    oportunidades_result = await session.execute(
        select(Oportunidade).where(Oportunidade.cliente_id == cliente.id)
    )
    for oportunidade in oportunidades_result.scalars().all():
        items.append(
            ContextItem(
                source_type="oportunidade",
                source_id=oportunidade.id,
                titulo=f"Oportunidade ({oportunidade.status.value})",
                data=None,
                texto=(
                    f"{oportunidade.descricao} — potencial {oportunidade.potencial.value}, "
                    f"status {oportunidade.status.value}."
                ),
            )
        )

    acoes_result = await session.execute(select(Acao).where(Acao.cliente_id == cliente.id))
    for acao in acoes_result.scalars().all():
        items.append(
            ContextItem(
                source_type="acao",
                source_id=acao.id,
                titulo=f"Ação ({acao.status.value})",
                data=acao.prazo,
                texto=f"{acao.descricao} — status {acao.status.value}.",
            )
        )

    evolucoes_result = await session.execute(
        select(Evolucao).where(Evolucao.cliente_id == cliente.id).order_by(Evolucao.data_referencia)
    )
    evolucoes = list(evolucoes_result.scalars().all())
    evolucao_items = [
        ContextItem(
            source_type="evolucao",
            source_id=e.id,
            titulo=e.titulo,
            data=e.data_referencia,
            texto=(
                f"Contexto: {e.contexto} Situação: {e.situacao} Ação realizada: {e.acao_realizada}"
                + (f" Resultado: {e.resultado}" if e.resultado else "")
            ),
        )
        for e in evolucoes
    ]

    orcamento_restante = TOKEN_BUDGET_CHARS - sum(_item_len(i) for i in items)
    if sum(_item_len(i) for i in evolucao_items) > orcamento_restante:
        evolucao_items = evolucao_items[-EVOLUCOES_RECENTES_FALLBACK:]

    return items + evolucao_items


async def build_context_for_cliente(
    session: AsyncSession, cliente_id: uuid.UUID
) -> list[ContextItem]:
    result = await session.execute(select(Cliente).where(Cliente.id == cliente_id))
    cliente = result.scalar_one_or_none()
    if cliente is None:
        return []
    return await _cliente_items(session, cliente)


async def build_context_by_search(session: AsyncSession, pergunta: str) -> list[ContextItem]:
    """Sem cliente identificável: busca textual simples (SPECS.md §10, §11.2.2) nos nomes de
    cliente para achar candidatos, e usa o resumo de cada um como contexto."""
    palavras = [p for p in re.split(r"\W+", pergunta.lower()) if len(p) > 2 and p not in STOPWORDS]
    if not palavras:
        return []

    condicoes = [Cliente.nome.ilike(f"%{p}%") for p in palavras]
    result = await session.execute(
        select(Cliente).where(Cliente.ativo.is_(True), or_(*condicoes)).limit(5)
    )
    clientes = list(result.scalars().all())

    items: list[ContextItem] = []
    for cliente in clientes:
        cliente_items = await _cliente_items(session, cliente)
        if sum(_item_len(i) for i in items + cliente_items) > TOKEN_BUDGET_CHARS:
            break
        items.extend(cliente_items)
    return items


async def build_context(
    session: AsyncSession, cliente_id: uuid.UUID | None, pergunta: str
) -> list[ContextItem]:
    if cliente_id is not None:
        return await build_context_for_cliente(session, cliente_id)
    return await build_context_by_search(session, pergunta)
