import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.errors import NotFoundError
from app.models.cliente import Cliente
from app.models.evolucao import Evolucao
from app.schemas.evolucao import EvolucaoCreate, EvolucaoRead, EvolucaoUpdate
from app.services import tag_service

ENTITY_TYPE = "evolucao"


async def _ensure_cliente_exists(session: AsyncSession, cliente_id: uuid.UUID) -> None:
    result = await session.execute(select(Cliente.id).where(Cliente.id == cliente_id))
    if result.scalar_one_or_none() is None:
        raise NotFoundError("Cliente não encontrado")


async def _get_orm(session: AsyncSession, evolucao_id: uuid.UUID) -> Evolucao:
    result = await session.execute(select(Evolucao).where(Evolucao.id == evolucao_id))
    evolucao = result.scalar_one_or_none()
    if evolucao is None:
        raise NotFoundError("Evolução não encontrada")
    return evolucao


async def _to_read(session: AsyncSession, evolucao: Evolucao) -> EvolucaoRead:
    tags = await tag_service.get_tags(session, ENTITY_TYPE, evolucao.id)
    return EvolucaoRead(
        id=evolucao.id,
        cliente_id=evolucao.cliente_id,
        data_referencia=evolucao.data_referencia,
        titulo=evolucao.titulo,
        contexto=evolucao.contexto,
        situacao=evolucao.situacao,
        acao_realizada=evolucao.acao_realizada,
        resultado=evolucao.resultado,
        evidencia=evolucao.evidencia,
        responsavel_id=evolucao.responsavel_id,
        impacto_percebido=evolucao.impacto_percebido,
        impacto_detalhe=evolucao.impacto_detalhe,
        observacoes=evolucao.observacoes,
        tags=tags,
        created_at=evolucao.created_at,
        updated_at=evolucao.updated_at,
    )


async def list_evolucoes(session: AsyncSession, cliente_id: uuid.UUID) -> list[EvolucaoRead]:
    await _ensure_cliente_exists(session, cliente_id)
    result = await session.execute(
        select(Evolucao)
        .where(Evolucao.cliente_id == cliente_id)
        .order_by(Evolucao.data_referencia.desc())
    )
    return [await _to_read(session, e) for e in result.scalars().all()]


async def create_evolucao(
    session: AsyncSession, cliente_id: uuid.UUID, data: EvolucaoCreate
) -> EvolucaoRead:
    await _ensure_cliente_exists(session, cliente_id)
    payload = data.model_dump(exclude={"tags"})
    evolucao = Evolucao(cliente_id=cliente_id, **payload)
    session.add(evolucao)
    await session.flush()
    await tag_service.set_tags(session, ENTITY_TYPE, evolucao.id, data.tags)
    await session.commit()
    await session.refresh(evolucao)
    return await _to_read(session, evolucao)


async def update_evolucao(
    session: AsyncSession, evolucao_id: uuid.UUID, data: EvolucaoUpdate
) -> EvolucaoRead:
    evolucao = await _get_orm(session, evolucao_id)
    updates = data.model_dump(exclude_unset=True, exclude={"tags"})
    for field, value in updates.items():
        setattr(evolucao, field, value)
    if data.tags is not None:
        await tag_service.set_tags(session, ENTITY_TYPE, evolucao.id, data.tags)
    await session.commit()
    await session.refresh(evolucao)
    return await _to_read(session, evolucao)
