from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.cliente import Cliente
from app.models.evolucao import Evolucao, Impacto
from app.models.gp import GP
from app.models.oportunidade import Oportunidade, StatusOportunidade
from app.schemas.dashboard import (
    ContagemFase,
    ContagemGP,
    ContagemSaude,
    DashboardStats,
    EvolucaoResumo,
)

OPORTUNIDADE_ATIVA_STATUSES = (
    StatusOportunidade.IDENTIFICADA,
    StatusOportunidade.EM_ANALISE,
    StatusOportunidade.EM_EXECUCAO,
)


async def _clientes_por_fase(session: AsyncSession) -> list[ContagemFase]:
    result = await session.execute(
        select(Cliente.fase, func.count(Cliente.id))
        .where(Cliente.ativo.is_(True))
        .group_by(Cliente.fase)
    )
    return [ContagemFase(fase=fase, total=total) for fase, total in result.all()]


async def _clientes_por_saude(session: AsyncSession) -> list[ContagemSaude]:
    result = await session.execute(
        select(Cliente.health_status, func.count(Cliente.id))
        .where(Cliente.ativo.is_(True))
        .group_by(Cliente.health_status)
    )
    return [ContagemSaude(health_status=hs, total=total) for hs, total in result.all()]


async def _clientes_por_gp(session: AsyncSession) -> list[ContagemGP]:
    result = await session.execute(
        select(GP.nome, func.count(Cliente.id))
        .join(Cliente, Cliente.gp_id == GP.id)
        .where(Cliente.ativo.is_(True))
        .group_by(GP.nome)
        .order_by(GP.nome)
    )
    return [ContagemGP(gp_nome=nome, total=total) for nome, total in result.all()]


async def _oportunidades_ativas(session: AsyncSession) -> int:
    result = await session.execute(
        select(func.count(Oportunidade.id)).where(
            Oportunidade.status.in_(OPORTUNIDADE_ATIVA_STATUSES)
        )
    )
    return result.scalar_one()


async def _evolucoes_resumo(
    session: AsyncSession, *, apenas_impacto_positivo: bool, limit: int
) -> list[EvolucaoResumo]:
    stmt = (
        select(Evolucao)
        .join(Cliente, Cliente.id == Evolucao.cliente_id)
        .add_columns(Cliente.nome)
        .order_by(Evolucao.data_referencia.desc())
        .limit(limit)
    )
    if apenas_impacto_positivo:
        stmt = stmt.where(Evolucao.impacto_percebido == Impacto.POSITIVO)
    result = await session.execute(stmt)
    return [
        EvolucaoResumo(
            id=evolucao.id,
            cliente_id=evolucao.cliente_id,
            cliente_nome=cliente_nome,
            titulo=evolucao.titulo,
            data_referencia=evolucao.data_referencia,
            resultado=evolucao.resultado,
            impacto_percebido=evolucao.impacto_percebido,
        )
        for evolucao, cliente_nome in result.all()
    ]


async def get_dashboard_stats(session: AsyncSession) -> DashboardStats:
    total_clientes_result = await session.execute(
        select(func.count(Cliente.id)).where(Cliente.ativo.is_(True))
    )
    return DashboardStats(
        total_clientes=total_clientes_result.scalar_one(),
        clientes_por_fase=await _clientes_por_fase(session),
        clientes_por_saude=await _clientes_por_saude(session),
        clientes_por_gp=await _clientes_por_gp(session),
        oportunidades_ativas=await _oportunidades_ativas(session),
        ultimas_evolucoes=await _evolucoes_resumo(session, apenas_impacto_positivo=False, limit=5),
        cases_destaque=await _evolucoes_resumo(session, apenas_impacto_positivo=True, limit=5),
    )
